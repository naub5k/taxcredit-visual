# 고용증대세액공제 앱 API 구조 문서 (2025년 6월 최신 기준)

## 📋 API 구조 개요

이 프로젝트는 현재 **통합된 API 시스템**을 사용합니다:

1. **✅ 현재 사용 중**: `taxcredit-api-func.azurewebsites.net` (메인 API)
2. **❌ 과거 버전**: `taxcredit-ai-func-v2` (archive로 이동 완료)

## 🔄 API 호출 흐름 (현재 기준)

```
리액트 앱(src/components)
├── CompanyDetail.tsx
│   └── fetch(`${API_CONFIG.BASE_URL}/analyze?bizno=${bizno}`)
│       └── https://taxcredit-api-func.azurewebsites.net/api/analyze
├── TaxCreditDashboard.tsx  
│   └── analyzeCompanyTaxCredit() 서비스 함수 호출
│       └── taxCreditService.js를 통한 데이터 처리
└── RegionDetailPage.js
    └── fetch(`${baseUrl}/api/analyzeCompanyData?sido=${...}&gugun=${...}`)
        └── https://taxcredit-api-func.azurewebsites.net/api/analyzeCompanyData
```

## 🌐 현재 API 구조

```
/api/analyzeCompanyData 요청 (메인 API)
└── taxcredit-api-func.azurewebsites.net
    └── analyzeCompanyData/index.js 실행
        ├── 지역별 기업 데이터 조회
        ├── 페이지네이션 지원
        └── UTF-8 인코딩 최적화

/api/analyze 요청 (개별 기업 분석)
└── taxcredit-api-func.azurewebsites.net  
    └── analyze/index.js 실행
        ├── 개별 기업 세액공제 분석
        ├── InsuCleanRecord 타입 지원
        └── 3단계 위험도 분류
```

## ⚙️ 현재 API 구현 상세

### 1. analyzeCompanyData API (✅ 메인 지역별 조회)

- **엔드포인트**: `/api/analyzeCompanyData`
- **서버**: `taxcredit-api-func.azurewebsites.net`
- **구현 위치**: `taxcredit-api-func/analyzeCompanyData/index.js`
- **주요 사용처**: `RegionDetailPage.js`, 지역별 기업 목록 조회
- **기능**: 시도/구군별 페이지네이션 기업 데이터 조회

### 2. analyze API (✅ 개별 기업 분석)

- **엔드포인트**: `/api/analyze`  
- **서버**: `taxcredit-api-func.azurewebsites.net`
- **구현 위치**: `taxcredit-api-func/analyze/index.js`
- **주요 사용처**: `CompanyDetail.tsx`
- **기능**: 개별 기업 세액공제 상세 분석

### 3. ❌ 과거 버전 (정리 완료)

- **이전 서버**: `taxcredit-ai-func-v2.azurewebsites.net` → `archive/`로 이동
- **이전 API**: `getSampleList` → `analyzeCompanyData`로 통일
- **이전 서비스**: `taxCreditService.ts` → `taxCreditService.js`로 통일

## ⚠️ 현재 주의사항

1. **API 통일**: 모든 API 호출은 `taxcredit-api-func.azurewebsites.net` 기준
2. **타입 정의**: InsuCleanRecord 타입 기준으로 통일
3. **에러 처리**: success/error 구조 기준
4. **성능**: 페이지네이션 및 UTF-8 최적화 적용

## 🔄 현재 API 응답 형식

### analyzeCompanyData 응답 예시:
```json
{
  "success": true,
  "data": [
    {
      "사업장명": "주식회사 예시기업",
      "시도": "서울특별시", 
      "구군": "강남구",
      "업종코드": "62",
      "2020": 10,
      "2021": 12,
      "2022": 15,
      "2023": 18,
      "2024": 20
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 150
  }
}
```

### analyze 응답 예시:
```json
{
  "success": true, 
  "analysisData": [
    {
      "companyProfile": {
        "name": "주식회사 예시기업",
        "bizno": "123-45-67890"
      },
      "taxCreditAnalysis": {
        "totalCredit": 32200000,
        "riskLevel": "LOW"
      }
    }
  ]
}
```

## 🔍 현재 테스트 방법

1. **개별 기업 분석 테스트**:
   ```bash
   curl "https://taxcredit-api-func.azurewebsites.net/api/analyze?bizno=1234567890"
   ```

2. **지역별 기업 목록 테스트**:
   ```bash
   curl "https://taxcredit-api-func.azurewebsites.net/api/analyzeCompanyData?sido=서울특별시&page=1&pageSize=10"
   ```

## 📝 API 변경 시 확인사항

1. **현재 기준 준수**: pageConfig.js의 API_CONFIG 설정 확인
2. **타입 안전성**: InsuCleanRecord 타입 정의 준수  
3. **3단계 분류**: RISK_CLASSIFICATION 구조 유지
4. **UTF-8 인코딩**: 한글 데이터 처리 확인 