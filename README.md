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