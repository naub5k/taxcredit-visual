<<<<<<< HEAD
# 고용이력 현황 데이타 (~ 2025) 앱

이 프로젝트는 데이터베이스 필터링 과정을 시각적으로 보여주는 React 기반 웹 애플리케이션입니다.

## 업데이트 내역
- 2025.04.25: 배포 프로세스 개선 및 테스트
- 2025.05.02: 프로젝트 폴더 구조 정리 및 재구성
- 2025.05.15: Azure Static Web Apps 데이터베이스 연결 기능 추가
- 2025.05.17: 프로젝트 전체 구조 정리 및 문서화 개선

## ⚠️ API 호출 구조 안내

### API 구조 개요

이 프로젝트는 두 가지 독립적인 API 시스템을 포함하고 있습니다:

1. **v2 함수 API 시스템** (✅ 실제 사용 중)
   - 엔드포인트: `/api/getSampleList`
   - 서버: `taxcredit-api-func-v2.azurewebsites.net`
   - UI 컴포넌트에서 직접 호출

2. **data-api 시스템** (⚠️ 구현되었으나 현재 사용되지 않음)
   - 엔드포인트: `/data-api/rest/Sample`, `/data-api/graphql`
   - 참조 구현: `src/utils/deprecated/dataApiService.js`

상세 정보는 [my-app/docs/API_STRUCTURE.md](my-app/docs/API_STRUCTURE.md) 문서를 참조하세요.

## 프로젝트 기술 스택

- **프론트엔드 프레임워크**: React 18
- **UI 스타일링**: TailwindCSS
- **차트 라이브러리**: Recharts
- **배포 환경**: Azure Static Web Apps
- **배포 방식**: GitHub 작업 실행 (GitHub Actions)
- **데이터 액세스**: Azure Function API (v2)
- **중요 환경 변수**: `WEBSITE_RUN_FROM_PACKAGE` 설정 필요

## 프로젝트 구조

```
taxcredit_mobileapp/                # 프로젝트 최상위 디렉토리
├── my-app/                         # React 앱 본체
│   ├── build/                      # 빌드 결과물 (배포용)
│   ├── cursor_requests/            # Cursor AI와의 협업 요청 파일
│   │   ├── archive/                # 완료된 작업 요청서 보관
│   │   └── *.md                    # 각종 문서 및 참조 자료
│   ├── public/                     # 정적 파일
│   ├── src/
│   │   ├── components/             # React 컴포넌트
│   │   │   ├── FunnelChart.jsx     # 깔때기형 차트 컴포넌트
│   │   │   ├── RegionList.jsx      # 지역 목록 컴포넌트
│   │   │   ├── RegionDetailPage.js # 지역 상세 페이지 (v2 API 호출)
│   │   │   └── DataApiTest.js      # API 테스트 컴포넌트 (v2 API 호출)
│   │   ├── data/                   # 데이터 모델
│   │   │   └── dummyRefinementData.js # 샘플 데이터
│   │   ├── utils/                  # 유틸리티 함수
│   │   │   ├── deprecated/         # 미사용 코드
│   │   │   │   └── dataApiService.js  # (미사용) 데이터베이스 API 서비스
│   │   │   └── aiService.js        # AI 모델 호출 서비스
│   │   ├── App.js                  # 메인 앱 컴포넌트
│   │   └── index.js                # 진입점
│   ├── docs/                       # 문서 디렉토리
│   │   ├── API_STRUCTURE.md        # API 구조 상세 문서
│   │   └── STATICWEBAPP_CONFIG_GUIDE.md # 라우팅 설정 가이드
│   ├── scripts/                    # 스크립트 디렉토리
│   │   └── api-test.js             # API 테스트 스크립트
│   ├── api-test-responses/         # API 테스트 결과 저장소
│   ├── archives/                   # 완료된 작업 결과 보관
│   ├── .cursor/                    # Cursor AI 설정 및 작업 파일
│   ├── .gitignore                  # Git 무시 파일 목록
│   ├── package.json                # 의존성 및 스크립트 정의
│   ├── postcss.config.js           # PostCSS 설정
│   ├── staticwebapp.config.json    # Azure Static Web Apps 설정
│   └── tailwind.config.js          # TailwindCSS 설정
│
├── api-func/                       # Azure Functions API
│   ├── getSampleList/              # 샘플 데이터 조회 함수 (v2 API)
│   ├── utils/                      # API 유틸리티 함수
│   └── src/                        # 소스 코드
│
├── swa-db-connections/             # Static Web Apps 데이터베이스 연결 설정
│   └── staticwebapp.database.config.json # 데이터베이스 연결 구성 파일
│
├── scripts/                        # 모든 자동화 스크립트
│   └── deploy-static.ps1           # 정적 파일 배포 스크립트
│
├── docs/                           # 문서 및 가이드
│   ├── PROJECT_STRUCTURE.md        # 프로젝트 구조 문서
│   ├── GIT_DEPLOY_GUIDE.md         # Git 배포 가이드
│   └── 작업_결과_보고서.md          # 작업 결과 보고서
│
├── archives/                       # 배포 산출물 및 로그
│
├── README.md                       # 프로젝트 개요 및 가이드
└── .gitignore                      # 최상위 Git 무시 설정
```

> **참고**: 모든 개발 작업은 `taxcredit_mobileapp/my-app/` 디렉토리에서 수행해야 합니다.
> 이 디렉토리가 실제 애플리케이션의 루트 폴더이며, 모든 명령어도 이 디렉토리에서 실행해야 합니다.

## 로컬 개발 환경 설정

1. 저장소 클론:
   ```bash
   git clone https://github.com/naub5k/taxcredit-visual.git
   cd taxcredit-visual
   ```

2. 의존성 설치:
   ```bash
   cd my-app
   npm install
   ```

3. 개발 서버 실행:
   ```bash
   npm start
   ```
   애플리케이션이 http://localhost:3000 에서 실행됩니다.

## 로컬 개발 및 API 테스트

### API 테스트 방법

1. **API 서버 실행**:
   ```bash
   cd taxcredit_mobileapp/api-func
   func start
   ```
   로컬 API 서버가 http://localhost:7071 에서 실행됩니다.

2. **API 테스트 스크립트 실행**:
   ```bash
   cd taxcredit_mobileapp/my-app
   node scripts/api-test.js
   ```
   
   특정 지역으로 테스트:
   ```bash
   node scripts/api-test.js 서울특별시 강남구
   ```

### 개발/배포 환경 분기 구조

- **개발 환경(localhost)**: 로컬 API(`http://localhost:7071/api/getSampleList`)를 호출
- **배포 환경**: Azure API(`https://taxcredit-api-func-v2.azurewebsites.net/api/getSampleList`)를 호출

### 중요 구성 설정

Azure Portal에서 다음 설정이 필요합니다:
- **WEBSITE_RUN_FROM_PACKAGE**: 배포 시 1로 설정해야 함
- 이 설정이 누락될 경우 함수 앱이 제대로 작동하지 않을 수 있음

## 배포 방법

이 프로젝트는 GitHub Actions를 통해 Azure Static Web Apps에 자동 배포됩니다:

### GitHub Actions 자동 배포

1. `master` 브랜치에 코드를 푸시하면 GitHub Actions가 자동으로 트리거됩니다:
   ```bash
   git add .
   git commit -m "변경 내용 설명"
   git push origin master
   ```

2. GitHub Actions 워크플로우가 자동으로 실행되어 다음 작업을 수행합니다:
   - 의존성 설치 (`npm install`)
   - 앱 빌드 (`npm run build`)
   - Azure Static Web Apps에 배포

### 수동 배포 (선택적)

정적 빌드 파일 배포가 필요한 경우:

1. 정적 파일 배포 스크립트 실행:
   ```bash
   cd taxcredit_mobileapp
   ./scripts/deploy-static.ps1
   ```
   이 명령은 로컬에서 빌드하고 결과물을 Azure에 직접 배포합니다.

배포된 애플리케이션은 다음 URL에서 접근 가능합니다:
- https://polite-desert-03a31df00.6.azurestaticapps.net

### SPA 라우팅

이 앱은 Single Page Application으로, `staticwebapp.config.json` 파일을 통해 Azure에서 라우팅을 설정합니다. 이 파일은 모든 라우트를 `index.html`로 리디렉션합니다.

## 프로젝트 리소스 정보

### Azure 리소스
- **리소스 그룹**: taxcredit-rg
- **지역**: Korea Central
- **API 함수 앱**: taxcredit-api-func-v2.azurewebsites.net
- **정적 웹앱**: https://polite-desert-03a31df00.6.azurestaticapps.net
- **배포 방식**: GitHub Actions (azure-static-web-apps-polite-desert-03a31df00.yml)

## 프로젝트 유지 관리

- **의존성 업데이트**: `npm outdated` 명령을 실행하여 업데이트가 필요한 패키지를 확인하고, `npm update` 명령으로 업데이트할 수 있습니다.
- **프로덕션 빌드**: `npm run build` 명령으로 최적화된 프로덕션 빌드를 생성합니다. 

## Cursor 작업 요청

Cursor AI에 작업을 요청하려면 `cursor_requests` 폴더에 요청서를 작성합니다:

1. 파일 형식: `작업요청서_YYYY-MM-DD_순번.md`
2. 요청 처리 후 결과는 `archives` 폴더에 저장됩니다.
3. 작업 요청서는 다음과 같은 내용을 포함해야 합니다:
   - 요청 개요
   - 세부 요청 항목
   - 수행해야 할 작업에 대한 명확한 설명

작업 요청은 프로젝트의 효율적인 개발과 관리를 위한 협업 도구로 활용됩니다. 
=======
# 🎨 TaxCredit Visual - 시각화 웹앱

[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8)](https://tailwindcss.com/)
[![Performance](https://img.shields.io/badge/성능-99.8%25%20개선-brightgreen)](https://github.com/yourusername/taxcredit)

> **일반 사용자를 위한 고용세액공제 데이터 시각화 웹 애플리케이션**  
> 직관적인 UI와 빠른 성능으로 기업 데이터를 쉽게 탐색

---

## 🎯 **프로젝트 개요**

세무사, 회계사, 기업 담당자들이 **고용세액공제 혜택을 받을 수 있는 기업**을 쉽게 찾고 분석할 수 있도록 돕는 시각화 도구입니다.

### ✨ **주요 특징**
- 🚀 **0.8초 응답** - 99.8% 성능 개선으로 즉시 반응
- 🗺️ **지역별 탐색** - 시도/구군별 기업 현황 시각화
- 🔍 **정밀 검색** - 사업장명/사업자등록번호 통합 검색
- 📊 **데이터 시각화** - 연도별 고용인원 변화 차트
- 📱 **모바일 최적화** - 반응형 디자인으로 모든 기기 지원

---

## 🏗️ **프로젝트 구조**

```
📁 taxcredit-visual/
├── 📁 my-app/                    # React 웹 애플리케이션
│   ├── 📁 src/
│   │   ├── 📁 components/        # UI 컴포넌트
│   │   │   ├── RegionDetailPage.js    # 지역별 기업 목록
│   │   │   ├── PartnerPage.js          # 파트너 전용 검색
│   │   │   ├── CompanyDetailPage.js    # 기업 상세 분석
│   │   │   └── HomePage.js             # 메인 홈페이지
│   │   ├── 📁 config/            # 설정 파일
│   │   │   └── apiConfig.js             # API 엔드포인트 설정
│   │   ├── 📁 utils/             # 유틸리티
│   │   │   ├── dataCache.js             # IndexedDB 캐싱
│   │   │   └── performance.js           # 성능 추적
│   │   └── 📁 services/          # API 서비스
│   ├── package.json
│   └── public/
│       └── staticwebapp.config.json    # Azure 배포 설정
└── 📁 cursor_requests/           # 개발 요청서 모음
```

---

## 🚀 **빠른 시작**

### **1. 로컬 개발 환경**
```bash
# 프로젝트 클론
git clone https://github.com/yourusername/taxcredit.git
cd taxcredit/taxcredit-visual/my-app

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 브라우저에서 확인
# http://localhost:3000
```

### **2. 빌드 및 배포**
```bash
# 프로덕션 빌드
npm run build

# Azure Static Web Apps 배포
# GitHub Actions 자동 배포 또는 수동 업로드
```

---

## 📱 **주요 기능**

### **🗺️ 지역별 기업 탐색**
- **시도/구군 선택**: 드롭다운으로 지역 선택
- **페이지 단위 로딩**: 10건씩 빠른 페이지 로딩
- **실시간 통계**: 지역별 기업 수, 평균 고용인원 표시

### **🔍 고급 검색 (파트너 전용)**
- **사업장명 검색**: 부분 일치로 유연한 검색
- **사업자등록번호 검색**: 정확한 10자리 번호 검색
- **복합 필터**: 지역 + 검색어 조합 가능

### **📊 데이터 시각화**
- **연도별 차트**: 2016-2024년 고용인원 변화 추이
- **반응형 그래프**: 모바일에서도 선명한 차트 표시
- **상대적 비교**: 지역 내 최대값 대비 상대적 크기 표시

### **⚡ 성능 최적화**
- **선택적 집계**: 필요시에만 통계 정보 로드
- **스마트 캐싱**: IndexedDB 기반 클라이언트 캐싱
- **선제적 로딩**: 다음 페이지 백그라운드 로드

---

## 🛠️ **기술 스택**

### **프론트엔드**
- **React 18** - 최신 React 기능 활용
- **JavaScript ES6+** - 모던 자바스크립트
- **TailwindCSS** - 유틸리티 우선 CSS 프레임워크
- **Recharts** - React용 차트 라이브러리

### **상태 관리 & 캐싱**
- **React Hooks** - useState, useEffect, useCallback
- **IndexedDB** - 브라우저 내 구조적 데이터 저장
- **Service Worker** - 오프라인 지원 (선택적)

### **API 통신**
- **Fetch API** - 네이티브 HTTP 클라이언트
- **REST API** - taxcredit-api-func와 통신
- **CORS** - 크로스 오리진 요청 지원

---

## ⚡ **성능 최적화**

### **클라이언트 최적화**

#### **1. 페이지 단위 로딩**
```javascript
// 기본 모드: 빠른 로딩 (집계 제외)
const fetchPageData = async (page = 1, pageSize = 10) => {
  const apiUrl = `${API_BASE}/analyzeCompanyData?page=${page}&pageSize=${pageSize}&includeAggregates=false`;
  // 0.8초 이내 응답
};
```

#### **2. 선택적 집계 로딩**
```javascript
// 필요시에만 집계 정보 요청
const loadAggregates = async () => {
  setIncludeAggregates(true);
  // 사용자가 "집계 정보 보기" 클릭시에만 실행
};
```

#### **3. 스마트 캐싱**
```javascript
// IndexedDB 기반 캐싱
const dataCache = {
  get: (sido, gugun, page, pageSize) => {/* 캐시 조회 */},
  set: (sido, gugun, page, pageSize, data) => {/* 캐시 저장 */},
  preload: (nextPages) => {/* 선제적 로딩 */}
};
```

### **성능 개선 결과**

| 기능 | 개선 전 | 개선 후 | 개선율 |
|------|---------|---------|--------|
| **지역별 조회** | 109초 | **0.8초** | 99.3% |
| **초기 로딩** | 무한로딩 | **1초** | ✅ 해결 |
| **페이지 이동** | 10초+ | **0.3초** | 97% |
| **검색 기능** | 오류 | **4초** | ✅ 해결 |

---

## 🎨 **UI/UX 특징**

### **디자인 시스템**
- **색상**: Blue/Purple 기반 전문적인 색상 팔레트
- **타이포그래피**: 시스템 폰트 기반 가독성 최적화
- **아이콘**: Heroicons으로 일관된 시각적 언어
- **그리드**: Flexbox/Grid 기반 반응형 레이아웃

### **사용자 경험**
- **직관적 네비게이션**: 한 번의 클릭으로 원하는 정보 접근
- **실시간 피드백**: 로딩 상태, 에러 상태 명확한 표시
- **키보드 지원**: 접근성을 위한 키보드 내비게이션
- **모바일 퍼스트**: 터치 친화적인 인터페이스

### **반응형 디자인**
```css
/* TailwindCSS 브레이크포인트 */
sm: 640px   /* 모바일 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
```

---

## 🔗 **API 연동**

### **백엔드 API**
- **엔드포인트**: `https://taxcredit-api-func.azurewebsites.net`
- **메인 API**: `/api/analyzeCompanyData`
- **인증**: 현재 불필요 (Public API)

### **API 응답 구조**
```javascript
{
  success: true,
  data: [...], // 기업 데이터 배열
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 124852,
    totalPages: 12486,
    hasNext: true,
    hasPrev: false
  },
  aggregates: {
    totalCount: 124852,
    maxEmployeeCount: 2046,
    avgEmployeeCount: 33,
    aggregatesCalculated: true
  },
  performance: {
    queryDuration: 856,
    optimizationApplied: true
  }
}
```

### **환경별 API 설정**
```javascript
// src/config/apiConfig.js
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://taxcredit-api-func.azurewebsites.net'
    : 'http://localhost:7071',
  ENDPOINTS: {
    ANALYZE_COMPANY_DATA: '/api/analyzeCompanyData',
    ANALYZE: '/api/analyze'
  }
};
```

---

## 🧪 **테스트**

### **로컬 테스트**
```bash
# 단위 테스트 (미구현)
npm test

# 통합 테스트 (미구현)
npm run test:integration

# E2E 테스트 (미구현)
npm run test:e2e
```

### **수동 테스트 체크리스트**
- [ ] 홈페이지 로딩
- [ ] 지역 선택 및 데이터 표시
- [ ] 페이지네이션 동작
- [ ] 파트너 검색 기능
- [ ] 기업 상세 페이지 연동
- [ ] 모바일 반응형 확인

---

## 🚀 **배포**

### **Azure Static Web Apps 배포**

#### **GitHub Actions 자동 배포**
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [ main ]
    paths: [ 'taxcredit-visual/**' ]

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          app_location: "/taxcredit-visual/my-app"
          output_location: "build"
```

#### **수동 배포**
```bash
# 빌드 생성
npm run build

# Azure CLI로 배포
az staticwebapp create \
  --name taxcredit-visual \
  --resource-group rg-taxcredit \
  --source https://github.com/yourusername/taxcredit \
  --location "Central US" \
  --branch main \
  --app-location "/taxcredit-visual/my-app" \
  --output-location "build"
```

---

## 🤝 **개발 가이드**

### **코딩 컨벤션**
- **파일명**: PascalCase for components (HomePage.js)
- **함수명**: camelCase (fetchPageData)
- **상수명**: UPPER_SNAKE_CASE (API_CONFIG)
- **CSS클래스**: TailwindCSS utility classes

### **컴포넌트 구조**
```javascript
// 컴포넌트 템플릿
import React, { useState, useEffect } from 'react';

function ComponentName() {
  // 1. State
  const [loading, setLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    // 초기화 로직
  }, []);
  
  // 3. Handlers
  const handleAction = () => {
    // 이벤트 처리
  };
  
  // 4. Render
  return (
    <div className="container mx-auto">
      {/* JSX */}
    </div>
  );
}

export default ComponentName;
```

### **기여 방법**
1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📈 **로드맵**

### **v1.1.0 (예정)**
- [ ] TypeScript 마이그레이션
- [ ] Unit Test 추가
- [ ] PWA 지원 (오프라인 모드)
- [ ] 데이터 내보내기 (Excel/CSV)

### **v1.2.0 (예정)**
- [ ] 고급 필터링 옵션
- [ ] 즐겨찾기 기능
- [ ] 사용자 설정 저장
- [ ] 다크 모드 지원

---

## 📞 **지원**

- **라이브 데모**: 배포 준비 중
- **API 문서**: [taxcredit-api-func](../taxcredit-api-func/)
- **GitHub**: [프로젝트 리포지토리](https://github.com/yourusername/taxcredit)
- **이슈**: [GitHub Issues](https://github.com/yourusername/taxcredit/issues)

---

<div align="center">
  <strong>🎨 TaxCredit Visual</strong><br>
  <em>데이터를 직관적으로, 성능을 빠르게</em>
</div> 
>>>>>>> 8c35d87 (init: 시각화 웹앱 초기화 및 독립 저장소 구성 - React JavaScript, Azure Static Web Apps 배포 준비)
