# publishProfile ZipDeploy 노드 전용 정밀 파싱 결과 보고서

## 📌 문제 상황 심층 분석

GitHub Actions 워크플로우에서 Azure App Service로 ZIP 배포 시 다음과 같은 오류가 반복적으로 발생했습니다:

```
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
ftps://waws-prod-se1-009.ftp.azurewebsites.windows.net/site/wwwroot
...
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net
ftps://...
.../api/zipdeploy
curl: (1) Unsupported protocol
```

이 문제의 구조적 원인:

1. Azure의 publish profile XML에는 여러 유형(ZipDeploy, FTP, WebDeploy 등)의 배포 프로필이 포함됨
2. 이전 파싱 방식은 단순 문자열 처리(`grep | head`)로 첫 줄만 선택했지만, URL 결과가 혼합됨
3. 여러 개의 publishProfile이 혼합된 상태에서 문자열 처리는 URL 구성을 오염시킴
4. 결과적으로 `curl`이 잘못된 프로토콜 오류(exit code 1)를 반환함

## 🛠️ 적용된 해결책

### 1. `publishMethod="ZipDeploy"`가 포함된 노드만 정밀 추출

**변경 전**:
```bash
# 문자열 처리 방식 (문제 발생)
PUBLISH_URL_RAW=$(grep 'publishUrl=' publishprofile.xml | head -n1 | grep -o 'publishUrl="[^"]*"' | cut -d'"' -f2)
USERNAME=$(grep 'userName=' publishprofile.xml | head -n1 | grep -o 'userName="[^"]*"' | cut -d'"' -f2)
PASSWORD=$(grep 'userPWD=' publishprofile.xml | head -n1 | grep -o 'userPWD="[^"]*"' | cut -d'"' -f2)
```

**변경 후**:
```bash
# awk를 사용한 정밀 추출 (ZipDeploy 노드만 대상)
PUBLISH_URL_RAW=$(awk '/publishProfile/ && /publishMethod="ZipDeploy"/ { match($0, /publishUrl="[^"]+"/); print substr($0, RSTART+12, RLENGTH-13); exit }' publishprofile.xml)
USERNAME=$(awk '/publishProfile/ && /publishMethod="ZipDeploy"/ { match($0, /userName="[^"]+"/); print substr($0, RSTART+10, RLENGTH-11); exit }' publishprofile.xml)
PASSWORD=$(awk '/publishProfile/ && /publishMethod="ZipDeploy"/ { match($0, /userPWD="[^"]+"/); print substr($0, RSTART+9, RLENGTH-10); exit }' publishprofile.xml)
```

### 2. 백업 추출 메커니즘 추가

ZipDeploy 노드가 없는 경우를 대비한 백업 추출 로직:
```bash
# 백업 추출 방식 (ZipDeploy가 없는 경우를 위한 대비책)
if [ -z "$PUBLISH_URL_RAW" ]; then
  echo "⚠️ ZipDeploy 노드를 찾지 못했습니다. 다른 방식으로 시도합니다..."
  # SCM 도메인 기반 추출 (*.scm.azurewebsites.net 패턴 우선)
  PUBLISH_URL_RAW=$(awk '/publishProfile/ && /\.scm\.azurewebsites\.net/ { match($0, /publishUrl="[^"]+"/); print substr($0, RSTART+12, RLENGTH-13); exit }' publishprofile.xml)
  USERNAME=$(awk '/publishProfile/ && /\.scm\.azurewebsites\.net/ { match($0, /userName="[^"]+"/); print substr($0, RSTART+10, RLENGTH-11); exit }' publishprofile.xml)
  PASSWORD=$(awk '/publishProfile/ && /\.scm\.azurewebsites\.net/ { match($0, /userPWD="[^"]+"/); print substr($0, RSTART+9, RLENGTH-10); exit }' publishprofile.xml)
fi
```

### 3. 강화된 검증 로직

```bash
# 값이 추출되었는지 검증
if [ -z "$PUBLISH_URL_RAW" ] || [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
  echo "::error::ZipDeploy 노드 또는 SCM 도메인에서 필요한 정보를 추출하지 못했습니다."
  echo "publishprofile.xml 내용 분석:"
  grep -n "publishProfile" publishprofile.xml
  echo "::error::PublishProfile 파싱 실패. 배포가 중단됩니다."
  exit 1
fi

# URL 형식 검증 - 최종 URL이 유효한지 확인
if [[ ! "$KUDU_API_URL" =~ ^https://[^/]+\.scm\.azurewebsites\.net/api/zipdeploy$ ]]; then
  echo "::error::최종 Kudu API URL이 예상 형식과 일치하지 않습니다: $KUDU_API_URL"
  exit 1
fi
```

## ✅ 적용 결과

### 1. ZipDeploy 노드 정밀 추출 결과

```
ZipDeploy 노드 정밀 추출 시작...
Raw publishUrl: taxcredit-visual.scm.azurewebsites.net:443
추출된 배포 정보:
- URL: taxcredit-visual.scm.azurewebsites.net:443
- Username: $taxcredit-visual
- Password: ********
```

### 2. URL 처리 및 검증 결과

```
Processed Kudu domain: taxcredit-visual.scm.azurewebsites.net
Final Kudu API URL: https://taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
✅ URL 형식 검증 통과: https://taxcredit-visual.scm.azurewebsites.net/api/zipdeploy
```

### 3. curl 실행 및 배포 결과

```
curl exit code: 0
HTTP response code: 202
✅ Deployment successful with HTTP status code: 202

curl exit code for directory listing: 0
HTTP response code for directory listing: 200
✅ Successfully retrieved wwwroot directory listing
```

## 🔄 변경 사항의 기술적 의의

### 1. AWK 기반 정밀 파싱의 장점

1. **조건부 추출**: `/publishProfile/ && /publishMethod="ZipDeploy"/` 패턴으로 ZipDeploy 노드만 정확히 찾음
2. **정확한 속성 추출**: `match()` 함수와 `substr()`을 사용해 정확한 값만 추출
3. **즉시 종료**: `exit` 명령으로 첫 번째 발견 후 처리 종료하여 다중 결과 방지
4. **강건성**: 여러 줄의 XML에서도 정확한 값만 추출하는 안정적인 방식

### 2. 다중 방어 전략 적용

1. **주 추출 방식**: ZipDeploy 노드 기반 정밀 추출
2. **백업 추출 방식**: SCM 도메인 기반 추출 (ZipDeploy 노드가 없는 경우)
3. **URL 형식 검증**: 추출된 값이 예상 형식과 일치하는지 검증
4. **실패 시 즉시 중단**: 모든 단계에서 검증 실패 시 즉시 워크플로우 중단

## 📊 결론 및 권장사항

이번 수정으로 `publishProfile` XML에서 정확히 ZipDeploy 노드만 추출하여 안정적인 배포가 가능해졌습니다. 핵심 개선 사항:

1. **정확성**: ZipDeploy 노드만 정확히 추출하여 URL 오염 가능성 원천 차단
2. **강건성**: 다양한 XML 구조에도 대응 가능한 AWK 기반 정밀 파싱
3. **가용성**: 백업 추출 메커니즘으로 다양한 publish profile 형식에 대응

### 향후 권장사항

1. **최신 Azure 구조 모니터링**:
   - Azure가 미래에 publish profile 형식이나 배포 방식을 변경할 가능성 고려
   - 정기적으로 publish profile 구조 확인 및 파싱 로직 검토

2. **로깅 및 모니터링 강화**:
   - 파싱 단계별 결과를 더 상세히 로깅하여 문제 진단 용이성 향상
   - ZipDeploy 외 다른 배포 방식도 지원 가능하도록 확장성 검토

3. **전용 XML 파서 도입 검토**:
   - 더 복잡한 XML 구조 처리가 필요한 경우 `xmllint`나 `xmlstarlet` 활용 검토
   - GitHub Actions에서 이런 도구의 설치 및 사용 방법 문서화 