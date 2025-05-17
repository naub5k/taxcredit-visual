# 고용증대세액공제 앱 API 구조 문서

## 📋 API 구조 개요

이 프로젝트는 두 가지 독립적인 API 시스템을 포함하고 있습니다:

1. **v2 함수 API 시스템** (✅ 실제 사용 중)
2. **data-api 시스템** (⚠️ 구현되었으나 현재 사용되지 않음)

## 🔄 API 호출 흐름 (트리 형식)

```
리액트 앱(my-app/src/components)
├── RegionDetailPage.js
│   └── fetch(`${baseUrl}/api/getSampleList?sido=${...}&gugun=${...}`)
│       ├── 개발환경(localhost): http://localhost:7071/api/getSampleList
│       └── 프로덕션: https://taxcredit-api-func-v2.azurewebsites.net/api/getSampleList
└── DataApiTest.js
    └── fetch(`${getBaseUrl()}/api/getSampleList?...`)
        └── staticwebapp.config.json의 라우팅에 의해 API 함수로 요청 전달
```

## 🌐 API 라우팅 구조

```
/api/getSampleList 요청
└── 라우팅 설정(staticwebapp.config.json)
    └── "route": "/api/getSampleList"
        └── "serve": "https://taxcredit-api-func-v2.azurewebsites.net/api/getSampleList"
            └── v2 Azure Function이 실행됨
                └── api-func/getSampleList/index.js (API 함수 구현체)
```

## ⚙️ API 구현 상세

### 1. v2 함수 API 시스템 (✅ 실제 사용 중)

- **엔드포인트**: `/api/getSampleList`
- **서버**: `taxcredit-api-func-v2.azurewebsites.net`
- **구현 위치**: `api-func/getSampleList/index.js`
- **주요 사용처**: `RegionDetailPage.js`, `DataApiTest.js`
- **DB 연결**: `api-func/utils/db-utils.js`를 통해 데이터베이스 연결
- **기능**: 지역별 고용증대세액공제 데이터 조회 (시도/구군 기준)

### 2. data-api 시스템 (⚠️ 구현되었으나 실제 사용 안 함)

- **엔드포인트**: `/data-api/rest/Sample`, `/data-api/graphql`
- **구현 위치**: `src/utils/deprecated/dataApiService.js`
- **특징**: Azure Static Web Apps의 데이터베이스 연결 기능 활용
- **상태**: 코드는 구현되었으나 실제 앱에서는 사용되지 않음

## ⚠️ 주의사항

1. **UI와 API 연결**: 웹 UI는 v2 함수(`getSampleList`)를 직접 호출합니다. 이 함수의 변경은 UI에 직접적인 영향을 미칩니다.

2. **API 오류 시나리오**: `/api/getSampleList` API가 실패할 경우:
   - 404 오류: 라우팅 설정 확인 필요
   - 500 오류: 함수 로직 또는 DB 연결 오류 확인

3. **테스트 시**: 
   - 개발 환경: `func start` 명령으로 로컬 API 서버 실행 필요
   - 프로덕션: Azure 배포 버전의 API 자동 사용

## 🔄 API 응답 형식

v2 함수 응답 예시 (JSON 배열):
```json
[
  {
    "사업장명": "삼성전자",
    "시도": "서울특별시",
    "구군": "강남구",
    "2020": 120,
    "2021": 150,
    "2022": 180,
    "2023": 200,
    "2024": 220
  },
  ...
]
```

## 🔍 API 테스트 방법

1. **개발 환경 테스트**:
   ```bash
   # 1. API 서버 실행
   cd taxcredit_mobileapp/api-func
   func start
   
   # 2. React 앱 실행
   cd ../my-app
   npm start
   ```

2. **API 테스트 스크립트 실행**:
   ```bash
   cd taxcredit_mobileapp/my-app
   node scripts/api-test.js
   ```

## 📝 API 변경 시 확인사항

1. **v2 함수 변경 시**: 반드시 UI 영향도를 고려하여 전체 앱 테스트 필요
2. **응답 구조 변경 시**: 컴포넌트 업데이트 필요 (특히 `RegionDetailPage.js`)
3. **라우팅 설정 변경 시**: `staticwebapp.config.json` 확인 필요 