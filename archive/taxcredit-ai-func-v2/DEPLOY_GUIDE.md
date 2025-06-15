# Azure Function 수동 배포 가이드

## 🚀 **빠른 배포 방법**

### **1. Azure Portal에서 직접 배포**

1. **Azure Portal** → **Function Apps** → **taxcredit-ai-func-v2** 접속
2. **Deployment Center** → **Local Git** 또는 **External Git** 선택
3. **GitHub 연결** → 자동 배포 설정

### **2. VS Code Azure Functions Extension 사용**

1. VS Code에서 **Azure Functions Extension** 설치
2. `Ctrl+Shift+P` → **Azure Functions: Deploy to Function App**
3. **taxcredit-ai-func-v2** 선택하여 배포

### **3. Azure CLI 사용**

```bash
# 1. Azure CLI 로그인
az login

# 2. 함수 앱에 배포
az functionapp deployment source config-zip \
  --resource-group rg-taxcredit-mobileapp \
  --name taxcredit-ai-func-v2 \
  --src deployment.zip
```

### **4. Core Tools 사용**

```bash
# 1. 함수 앱에 직접 배포
func azure functionapp publish taxcredit-ai-func-v2

# 2. 특정 슬롯에 배포 (있는 경우)
func azure functionapp publish taxcredit-ai-func-v2 --slot staging
```

## 🔧 **배포 전 체크리스트**

### **필수 파일 확인**
- ✅ `analyze/index.js` - 메인 함수 코드
- ✅ `analyze/function.json` - 함수 설정
- ✅ `host.json` - 호스트 설정
- ✅ `package.json` - 의존성 정보

### **코드 검증**
- ✅ `🚀 함수 시작!` 로그가 첫 줄에 있는지 확인
- ✅ `module.exports = async function (context, req)` 구문 정확성
- ✅ try-catch 블록 완전성
- ✅ context.res 설정 완료

## 📋 **배포 후 확인사항**

### **1. Azure Portal에서 확인**
- **Function Apps** → **taxcredit-ai-func-v2** → **Functions** → **analyze** 존재 확인
- **Log stream**에서 `🚀 함수 시작!` 로그 출력 확인

### **2. 테스트 호출**
```bash
# GET 요청 테스트
curl "https://taxcredit-ai-func-v2.azurewebsites.net/api/analyze/1010116592"

# 응답 예시
{
  "success": true,
  "message": "Azure Function이 정상적으로 작동합니다!",
  "bizno": "1010116592",
  "timestamp": "2025-05-29T08:30:00.000Z"
}
```

### **3. 로그 스트림 확인**
```
🚀 함수 시작!
✅ try 블록 진입
✅ CORS 헤더 설정 완료
📝 사업자등록번호 추출: 1010116592
✅ 응답 데이터 준비 완료
✅ 200 응답 설정 완료
✅ 함수 정상 완료
```

## ⚠️ **문제 해결**

### **함수 진입 전 오류 (Duration: 2-3ms)**
- **원인**: index.js 구문 오류
- **해결**: 코드 재검토 및 재배포

### **CORS 오류**
- **원인**: 헤더 설정 누락
- **해결**: corsHeaders 설정 확인

### **404 오류**
- **원인**: 함수가 배포되지 않음
- **해결**: 배포 상태 확인 및 재배포

## 🔗 **유용한 링크**

- **Azure Portal**: https://portal.azure.com
- **Function App**: https://taxcredit-ai-func-v2.azurewebsites.net
- **GitHub Actions**: https://github.com/naub5k/taxcredit-mobileapp/actions
- **로컬 테스트 UI**: http://localhost:3001/func-test

---

**마지막 업데이트**: 2025-05-29
**버전**: 1.0.0 (안전한 테스트 버전) 