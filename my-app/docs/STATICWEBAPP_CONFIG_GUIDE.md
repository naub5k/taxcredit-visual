# Static Web App 라우팅 설정 가이드

`staticwebapp.config.json` 파일은 Azure Static Web Apps의 라우팅 및 동작을 정의하는 중요한 설정 파일입니다. 이 문서는 해당 파일의 주요 설정을 설명합니다.

## ⚠️ 중요: API 라우팅 설정

현재 설정의 가장 중요한 부분은 다음과 같습니다:

```json
{
  "routes": [
    {
      "route": "/api/getSampleList",
      "allowedRoles": ["anonymous"],
      "serve": "https://taxcredit-api-func-v2.azurewebsites.net/api/getSampleList",
      "methods": ["GET", "OPTIONS"],
      "priority": 100
    }
  ]
}
```

### 핵심 역할

- `/api/getSampleList` 경로로 들어오는 모든 요청을 
- Azure Function v2 API (`https://taxcredit-api-func-v2.azurewebsites.net/api/getSampleList`)로 리다이렉트
- 이 설정이 UI 컴포넌트와 백엔드 API를 연결하는 핵심 구성 요소

## 🛑 주의사항

1. **이 설정을 변경하면 UI가 작동하지 않습니다.** RegionDetailPage.js 및 DataApiTest.js 컴포넌트가 이 API를 직접 호출합니다.

2. **우선순위(priority) 값 확인:** 다른 라우팅 설정보다 높은 우선순위(숫자가 낮을수록 우선순위 높음)를 가져야 합니다.

3. **CORS 설정:** API 함수의 CORS 헤더와 이 설정이 일치해야 합니다.

## 📝 변경이 필요한 경우

이 설정을 변경해야 하는 경우:

1. 관련 컴포넌트(RegionDetailPage.js, DataApiTest.js)도 함께 업데이트
2. API 함수 자체의 CORS 설정 확인
3. 변경 후 반드시 전체 앱 테스트 수행

## 📚 참조

추가 정보는 다음 문서를 참조하세요:
- [docs/API_STRUCTURE.md](./API_STRUCTURE.md) - API 구조 상세 설명 