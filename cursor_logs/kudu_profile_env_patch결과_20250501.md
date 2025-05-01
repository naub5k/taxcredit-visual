# Kudu API 배포를 위한 PublishProfile 참조 방식 개선 결과 보고서

## 📌 문제 상황 요약

GitHub Actions 워크플로우에서 `secrets.AZUREAPPSERVICE_PUBLISHPROFILE`을 직접 참조하여 Kudu API URL과 인증 정보를 추출할 때 다음과 같은 문제가 발생했습니다:

```
Raw publishUrl:
Processed Kudu domain:
Final Kudu API URL: https:///api/zipdeploy
curl: (6) Could not resolve host: api
```

이 문제는 GitHub Actions에서 secrets 값이 로그 출력 시 마스킹되면서 쉘 명령어 실행 중 파싱이 정상적으로 이루어지지 않아 발생했습니다.

## 🛠️ 적용된 해결책

### 1. 환경 변수를 통한 PublishProfile 전달

**변경 전**:
```yaml
- name: Manual deployment using Kudu API
  run: |
    # secrets를 직접 쉘 스크립트 내에서 참조
    PUBLISH_URL_RAW=$(echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" | grep -o 'publishUrl="[^"]*"' | cut -d'"' -f2)
    USERNAME=$(echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" | grep -o 'userName="[^"]*"' | cut -d'"' -f2)
    PASSWORD=$(echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" | grep -o 'userPWD="[^"]*"' | cut -d'"' -f2)
```

**변경 후**:
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
          # 환경 변수를 통해 전달된 값을 쉘 스크립트 내에서 참조
          PUBLISH_URL_RAW=$(echo "$PUBLISHPROFILE" | grep -o 'publishUrl="[^"]*"' | cut -d'"' -f2)
          USERNAME=$(echo "$PUBLISHPROFILE" | grep -o 'userName="[^"]*"' | cut -d'"' -f2)
          PASSWORD=$(echo "$PUBLISHPROFILE" | grep -o 'userPWD="[^"]*"' | cut -d'"' -f2)
```

### 2. 주요 개선 사항

1. **환경 변수 전달 방식 변경**:
   - 워크플로우 수준의 `env` 블록을 통해 `secrets.AZUREAPPSERVICE_PUBLISHPROFILE` 값을 `PUBLISHPROFILE` 환경 변수로 전달
   - 이를 통해 쉘 스크립트 내에서 마스킹 영향을 받지 않고 직접 값 참조 가능

2. **파싱 로직 유지**:
   - 기존의 파싱 로직(grep, cut 등)은 유지하되 참조하는 변수만 변경
   - 기존 URL 파싱 및 Kudu API URL 구성 로직도 그대로 유지

## ✅ 적용 결과

### 1. URL 파싱 결과

GitHub Actions 로그에서 확인된 파싱 결과:

```
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
Processed Kudu domain: taxcredit-visual.scm.azurewebsites.net
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
```

환경 변수를 통한 전달 방식을 적용한 결과, 마스킹 없이 정확한 PublishUrl 값이 추출되었습니다.

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
4. PublishProfile에서 배포 정보 추출
5. Kudu API를 통한 ZIP 파일 배포
6. 배포 검증

## 📊 결론 및 권장사항

GitHub Actions에서 secrets 값 마스킹으로 인한 URL 파싱 문제를 환경 변수를 통한 전달 방식으로 성공적으로 해결했습니다. 이 수정을 통해 GitHub Actions 워크플로우에서 Azure App Service로의 ZIP 배포가 안정적으로 작동하게 되었습니다.

### 향후 권장사항

1. **PublishProfile 관리 검토**:
   - Azure Portal에서 발급한 PublishProfile 정기적 갱신 검토
   - 필요시 서비스 주체(Service Principal) 기반 인증으로 전환 고려

2. **오류 처리 개선**:
   - 파싱 실패 시 대체 로직이나 명확한 오류 메시지 제공 검토
   - 예상치 못한 형식의 PublishProfile에 대한 예외 처리 추가

3. **비밀 정보 보안 강화**:
   - PASSWORD 등 민감 정보가 로그에 노출되지 않도록 추가 마스킹 처리 검토 