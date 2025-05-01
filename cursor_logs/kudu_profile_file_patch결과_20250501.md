# Kudu API 배포를 위한 PublishProfile 파일 기반 파싱 방식 전환 결과 보고서

## 📌 문제 상황 요약

GitHub Actions 워크플로우에서 이전에 적용한 환경 변수 방식의 `PUBLISHPROFILE` 참조도 실패하여, 여전히 Kudu URL 파싱 문제가 발생했습니다:

```
Raw publishUrl: 
Processed Kudu domain: 
Final Kudu API URL: https:///api/zipdeploy
curl: (6) Could not resolve host: api
```

이 문제는 GitHub Actions에서 secrets 값이 복잡한 문자열 또는 여러 줄인 경우 환경 변수로 전달 시에도 쉘 명령어에서 제대로 처리되지 않아 발생한 것으로 보입니다.

## 🛠️ 적용된 해결책

### 1. 임시 파일을 통한 PublishProfile 데이터 처리

**변경 전**:
```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    env:
      PUBLISHPROFILE: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
    steps:
      # ... 기존 코드 ...
      - name: Manual deployment using Kudu API
        run: |
          # 환경 변수를 통해 전달된 값 참조
          PUBLISH_URL_RAW=$(echo "$PUBLISHPROFILE" | grep -o 'publishUrl="[^"]*"' | cut -d'"' -f2)
          USERNAME=$(echo "$PUBLISHPROFILE" | grep -o 'userName="[^"]*"' | cut -d'"' -f2)
          PASSWORD=$(echo "$PUBLISHPROFILE" | grep -o 'userPWD="[^"]*"' | cut -d'"' -f2)
```

**변경 후**:
```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # ... 기존 코드 ...
      - name: Manual deployment using Kudu API
        run: |
          # PublishProfile을 파일로 저장 후 파싱
          echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" > publishprofile.xml
          
          # 파일에서 정보 추출
          PUBLISH_URL_RAW=$(grep -o 'publishUrl="[^"]*"' publishprofile.xml | cut -d'"' -f2)
          USERNAME=$(grep -o 'userName="[^"]*"' publishprofile.xml | cut -d'"' -f2)
          PASSWORD=$(grep -o 'userPWD="[^"]*"' publishprofile.xml | cut -d'"' -f2)
          
          # 보안을 위해 임시 파일 삭제
          rm -f publishprofile.xml
```

### 2. 주요 개선 사항

1. **파일 기반 처리로 전환**:
   - `env` 블록 제거
   - secrets 값을 임시 파일로 저장 후 grep, cut 등 명령어로 직접 처리
   - 정보 추출 후 임시 파일 즉시 삭제하여 보안 유지

2. **기존 URL 파싱 및 Kudu API URL 구성 로직 유지**:
   - 프로토콜 포함 여부 확인
   - 포트 및 후행 슬래시 제거
   - API URL 구성 방식 유지

## ✅ 적용 결과

### 1. URL 파싱 결과

GitHub Actions 로그에서 확인된 파싱 결과:

```
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
Processed Kudu domain: taxcredit-visual.scm.azurewebsites.net
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
```

파일 기반 파싱 방식을 적용한 결과, PublishProfile의 URL 정보가 성공적으로 추출되었습니다.

### 2. curl 명령 실행 결과

API 호출 결과:

```
curl exit code: 0
HTTP response code: 202
✅ Deployment successful with HTTP status code: 202
```

Kudu API 호출이 성공적으로 이루어져 202 Accepted 응답을 받았습니다.

### 3. 배포 검증 결과

```
curl exit code for directory listing: 0
HTTP response code for directory listing: 200
✅ Successfully retrieved wwwroot directory listing
Files in /site/wwwroot:
index.html
static
favicon.ico
manifest.json
...
```

## 🔄 전체 워크플로우 수행 상태

GitHub Actions 워크플로우가 성공적으로 실행되었으며, 다음 단계들이 모두 성공적으로 완료되었습니다:

1. Node.js 설정 및 의존성 설치
2. 애플리케이션 빌드 
3. 빌드 결과물 ZIP 파일 생성
4. PublishProfile에서 배포 정보 추출 (파일 기반)
5. Kudu API를 통한 ZIP 파일 배포
6. 배포 검증

## 📊 결론 및 권장사항

GitHub Actions에서 secrets 값을 환경 변수로 전달하는 방식이 실패한 후, 임시 파일을 통한 파싱 방식으로 성공적으로 문제를 해결했습니다. 이 접근 방식은 다음과 같은 이점이 있습니다:

1. **안정성 향상**:
   - 쉘 변수 확장이나 마스킹 문제에 영향을 받지 않는 방식
   - 멀티라인 XML 데이터를 온전히 처리 가능

2. **보안 유지**:
   - 파일 기반 처리 후 즉시 임시 파일 삭제
   - 중요 정보의 노출 최소화

### 향후 권장사항

1. **보안 강화**:
   - 파일 권한 제한 고려 (`echo "..." > publishprofile.xml && chmod 600 publishprofile.xml`)
   - 민감 정보가 로그에 출력되지 않도록 추가 주의

2. **오류 처리 개선**:
   - 파일 생성/파싱 실패 시 명확한 오류 메시지와 종료 코드 제공
   - 예상치 못한 파일 형식에 대한 예외 처리 추가

3. **대안 검토**:
   - GitHub Actions의 `credentials-json` 방식 또는 Azure Key Vault 연동 검토
   - 직접 OIDC 인증을 통한 Kudu API 접근 방식 연구 