# publish profile 파싱 정밀화 및 curl 오류 재발 방지 결과 보고서

## 📌 문제 상황 심층 분석

GitHub Actions 워크플로우에서 Azure App Service로 ZIP 배포 시 다음과 같은 오류가 발생했습니다:

```
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
ftps://waws-prod-se1-009.ftp.azurewebsites.windows.net/site/wwwroot
taxcredit-visual.scm.azurewebsites.net:443
Processed Kudu domain: taxcredit-visual.scm.azurewebsites.net
ftps://waws-prod-se1-009.ftp.azurewebsites.windows.net/site/wwwroot
taxcredit-visual.scm.azurewebsites.net
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net
ftps://waws-prod-se1-009.ftp.azurewebsites.windows.net/site/wwwroot
taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
curl: (3) URL rejected: Malformed input to a URL function
```

문제의 원인:

1. `publishUrl` 값을 추출할 때 **여러 개의 publishUrl 값이 함께 추출**되어 실제 변수에는 여러 줄이 저장됨
2. 이로 인해 KUDU_DOMAIN에 ftps:// URL을 포함한 여러 줄이 들어가면서 최종 API URL이 손상됨
3. 결과적으로 curl 호출 시 **Malformed input to a URL function** 오류(exit code 3)가 발생함

## 🛠️ 적용된 해결책

### 1. publishUrl, userName, userPWD 추출 로직 정밀화

**변경 전**:
```bash
PUBLISH_URL_RAW=$(grep -o 'publishUrl="[^"]*"' publishprofile.xml | cut -d'"' -f2)
USERNAME=$(grep -o 'userName="[^"]*"' publishprofile.xml | cut -d'"' -f2)
PASSWORD=$(grep -o 'userPWD="[^"]*"' publishprofile.xml | cut -d'"' -f2)
```

**변경 후**:
```bash
PUBLISH_URL_RAW=$(grep 'publishUrl=' publishprofile.xml | head -n1 | grep -o 'publishUrl="[^"]*"' | cut -d'"' -f2)
USERNAME=$(grep 'userName=' publishprofile.xml | head -n1 | grep -o 'userName="[^"]*"' | cut -d'"' -f2)
PASSWORD=$(grep 'userPWD=' publishprofile.xml | head -n1 | grep -o 'userPWD="[^"]*"' | cut -d'"' -f2)
```

주요 변경 사항:
- `grep 'publishUrl='` 패턴으로 라인 전체를 먼저 일치시킴 (부분 일치 방지)
- `head -n1`을 통해 최초 발견된 첫 번째 라인만 선택 (여러 라인 추출 방지)
- 이후 정확한 패턴만 추출하는 `grep -o` 적용

### 2. URL 형식 검증 로직 추가

```bash
# URL 형식 검증 - scm 호스트 이름이 맞는지 확인
if [[ ! "$KUDU_DOMAIN" =~ \.scm\.azurewebsites\.net$ ]]; then
  echo "::error::Kudu 도메인이 예상 형식(*.scm.azurewebsites.net)과 일치하지 않습니다: $KUDU_DOMAIN"
  echo "publishprofile.xml에서 추출된 문자열 확인:"
  grep -n 'publishUrl=' publishprofile.xml
  exit 1
fi

# URL 형식 검증 - 최종 URL이 유효한지 확인
if [[ ! "$KUDU_API_URL" =~ ^https://[^/]+\.scm\.azurewebsites\.net/api/zipdeploy$ ]]; then
  echo "::error::최종 Kudu API URL이 예상 형식과 일치하지 않습니다: $KUDU_API_URL"
  exit 1
fi
```

주요 기능:
- Kudu 도메인이 `.scm.azurewebsites.net`로 끝나는지 정규표현식으로 검증
- 최종 API URL이 Kudu zipdeploy 엔드포인트 형식과 일치하는지 검증
- 형식이 일치하지 않으면 배포 전에 워크플로우를 즉시 중단하고 오류 메시지 표시

## ✅ 적용 결과

### 1. 정밀화된 URL 파싱 결과

```
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
Processed Kudu domain: taxcredit-visual.scm.azurewebsites.net
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
```

### 2. curl 실행 결과

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

## 🔄 문제 해결 과정에서의 발견점

### 1. publishProfile XML 구조 특성 이해

Azure의 publishProfile XML에는 여러 개의 배포 프로필 정보가 포함될 수 있습니다:

```xml
<publishProfile 
  publishUrl="taxcredit-visual.scm.azurewebsites.net:443" 
  userName="..." 
  userPWD="..." 
  .../>
<publishProfile 
  publishUrl="ftps://waws-prod-se1-009.ftp.azurewebsites.windows.net/site/wwwroot" 
  userName="..." 
  userPWD="..." 
  .../>
```

이러한 구조로 인해 단순 패턴 매칭 방식의 추출은 위험합니다. 항상:
1. **첫 번째 publishProfile만** 대상으로 해야 함 (SCM/Kudu용 프로필)
2. **각 필드마다 정확히 원하는 속성만** 추출해야 함

### 2. curl URL 검증의 중요성

curl은 URL 형식에 매우 엄격합니다. URL에 개행이나 형식이 맞지 않는 문자가 포함되면 다음과 같은 오류가 발생합니다:

- exit code 3: URL rejected (잘못된 URL 형식)
- exit code 6: Could not resolve host (존재하지 않는 호스트)

따라서 API 호출 전에 URL 형식을 검증하는 것이 중요합니다.

## 📊 결론 및 권장사항

이번 수정을 통해 다음과 같은 개선점이 적용되었습니다:

1. **정밀한 데이터 추출**:
   - 첫 번째 publishProfile에서만 데이터 추출
   - 정확한 속성 값만 추출하여 여러 줄 문제 방지
   
2. **사전 검증 로직 강화**:
   - URL 형식 검증으로 잘못된 URL 구성 방지
   - 오류 발생 시 원인을 명확히 보여주는 디버깅 정보 제공

### 향후 권장사항

1. **publish profile 구조 변경 대응**:
   - Azure가 미래에 publish profile 형식을 변경할 가능성에 대비
   - 정기적으로 추출 로직 검토 및 테스트

2. **XML 파싱 도구 고려**:
   - 더 복잡한 XML 구조 처리가 필요하면 xmllint 또는 jq + yq 같은 도구 도입 검토

3. **오프라인 테스트 구현**:
   - 변경 전 샘플 XML로 파싱 로직 테스트할 수 있는 스크립트 개발
   - CI 파이프라인에 파싱 로직 유효성 검사 단계 추가 