# Kudu API 배포를 위한 PublishProfile 환경변수-파일 하이브리드 전환 결과 보고서

## 📌 문제 상황 심층 분석

GitHub Actions 워크플로우에서 반복적으로 Kudu 배포 URL 파싱이 실패하는 문제가 발생했습니다:

```
Raw publishUrl:
Processed Kudu domain:
Final Kudu API URL: https:///api/zipdeploy
curl: (6) Could not resolve host: api
```

두 가지 접근 방식을 모두 시도했으나 실패했습니다:
1. `secrets.AZUREAPPSERVICE_PUBLISHPROFILE`를 직접 쉘에서 파싱
2. 임시 파일로 저장 후 파싱 (`echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" > publishprofile.xml`)

원인을 분석한 결과, **GitHub Actions의 보안 정책** 때문에 발생한 문제임을 확인했습니다:

* GitHub Actions는 secrets 값을 로그에 출력하지 않도록 마스킹하는데, 이 마스킹은 `echo` 명령에도 적용됨
* 따라서 `echo "${{ secrets.XXXX }}"` 명령은 실제로 secrets 내용을 파일에 쓰지 못함
* secrets 값이 `env` 블록으로 전달되면 마스킹은 유지되나 스크립트 내에서는 접근 가능함

## 🛠️ 적용된 해결책

### 1. 환경변수-파일 하이브리드 방식 적용

**변경 전**:
```yaml
# 이전 접근법 1: 직접 파싱
PUBLISH_URL_RAW=$(echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" | grep -o 'publishUrl="[^"]*"' | cut -d'"' -f2)

# 이전 접근법 2: 파일 직접 생성
echo "${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}" > publishprofile.xml
```

**변경 후**:
```yaml
# 스텝 1: env 블록으로 secrets 값 전달
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    env:
      PUBLISHPROFILE: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
    steps:
      # ... 기존 코드 ...

# 스텝 2: 환경변수에서 파일로 저장
echo "$PUBLISHPROFILE" > publishprofile.xml

# 스텝 3: 파일에서 정보 추출
PUBLISH_URL_RAW=$(grep -o 'publishUrl="[^"]*"' publishprofile.xml | cut -d'"' -f2)
```

### 2. 주요 개선 사항

1. **환경변수-파일 방식의 이점**:
   - `env` 블록을 통해 전달된 값은 GitHub Actions 마스킹을 우회하면서도 접근 가능
   - 파일 시스템을 사용해 복잡한 XML 내용을 온전히 처리 가능
   - 일시적인 파일 사용으로 보안 위험 최소화

2. **강화된 오류 처리 및 검증**:
   - 파일 생성 성공 여부 검증 추가 (`if [ -s publishprofile.xml ]`)
   - 필수 정보 추출 여부 검증 추가 (`if [ -z "$PUBLISH_URL_RAW" ]`)
   - 각 단계별 명확한 오류 메시지 및 실행 상태 로깅

3. **보안 강화**:
   - 정보 추출 직후 임시 파일 삭제
   - 로그에 민감한 인증 정보가 직접 출력되지 않도록 주의

## ✅ 적용 결과

### 1. 파일 생성 및 파싱 결과

GitHub Actions 로그에서 확인된 결과:

```
✅ publishprofile.xml 파일이 성공적으로 생성되었습니다.
파일 크기: 4.2K
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
Processed Kudu domain: taxcredit-visual.scm.azurewebsites.net
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
✅ 민감한 정보가 포함된 임시 파일이 삭제되었습니다.
```

### 2. curl 명령 실행 결과

API 호출 결과:

```
curl exit code: 0
HTTP response code: 202
✅ Deployment successful with HTTP status code: 202
```

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

## 📊 결론 및 문제 해결 분석

이번 문제는 **GitHub Actions의 보안 메커니즘과 쉘 스크립트 간의 상호작용**에서 발생했습니다. GitHub Actions는 사용자의 secrets 값이 로그에 노출되는 것을 방지하기 위해 마스킹 처리를 하는데, 이 마스킹은 파일 쓰기 작업에도 영향을 주어 예상치 못한 동작을 발생시켰습니다.

해결 방법의 핵심은 다음과 같습니다:

1. **마스킹된 값의 이해**: GitHub Actions는 직접 `${{ secrets.XXX }}` 형식으로 참조된 값을 마스킹함
2. **환경변수 중개**: env 블록을 통해 secrets 값을 환경변수로 전달하면 접근성이 향상됨
3. **파일 시스템 활용**: 복잡한 XML을 단일 환경변수에서 처리하기보다 파일로 저장하여 표준 도구(grep 등)로 처리

## 향후 권장사항

1. **대체 인증 방식 검토**:
   - Azure Key Vault와 GitHub Actions 연동
   - Azure CLI 서비스 주체(Service Principal) 인증 사용

2. **CI/CD 파이프라인 보안 강화**:
   - 더 세분화된 권한으로 OIDC 인증 활용
   - publishprofile 대신 서비스 주체 권한으로 전환

3. **오류 모니터링 강화**:
   - GitHub Actions 워크플로우에 세부적인 로깅 추가
   - 모든 중요 단계에 검증 로직 추가 