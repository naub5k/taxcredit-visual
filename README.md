# DB 필터링 과정 시각화 앱

이 프로젝트는 데이터베이스 필터링 과정을 시각적으로 보여주는 React 기반 웹 애플리케이션입니다.

## 프로젝트 기술 스택

- **프론트엔드 프레임워크**: React 18
- **UI 스타일링**: TailwindCSS
- **차트 라이브러리**: Recharts
- **배포 환경**: Azure Static Web App
- **CI/CD**: GitHub Actions

## 프로젝트 구조

```
taxcredit_mobileapp/my-app/
├── .github/workflows/    # GitHub Actions 워크플로우 설정
├── build/                # 빌드 결과물 (배포용)
├── public/               # 정적 파일
├── src/
│   ├── components/       # React 컴포넌트
│   │   ├── FunnelChart.jsx  # 깔때기형 차트 컴포넌트
│   │   └── RegionList.jsx   # 지역 목록 컴포넌트
│   ├── data/             # 데이터 모델
│   │   └── dummyRefinementData.js  # 샘플 데이터
│   ├── App.js            # 메인 앱 컴포넌트
│   └── index.js          # 진입점
├── .gitignore            # Git 무시 파일 목록
├── package.json          # 의존성 및 스크립트 정의
├── postcss.config.js     # PostCSS 설정
└── tailwind.config.js    # TailwindCSS 설정
```

## 로컬 개발 환경 설정

1. 저장소 클론:
   ```bash
   git clone https://github.com/naub5k/taxcredit-visual.git
   cd taxcredit-visual
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

3. 개발 서버 실행:
   ```bash
   npm start
   ```
   애플리케이션이 http://localhost:3000 에서 실행됩니다.

## 배포 방법

이 프로젝트는 자동화된 CI/CD 파이프라인을 사용합니다:

1. `master` 브랜치에 변경사항을 커밋하고 푸시합니다.
2. GitHub Actions가 자동으로 빌드 및 테스트를 실행합니다.
3. 빌드가 성공하면 Azure Static Web App에 자동으로 배포됩니다.
4. 배포된 애플리케이션은 다음 URL에서 접근 가능합니다:
   - https://taxcredit-visual.azurewebsites.net

### SPA 라우팅

이 앱은 Single Page Application으로, `staticwebapp.config.json` 파일을 통해 Azure Static Web App에서 라우팅을 설정합니다. 이 파일은 모든 라우트를 `index.html`로 리디렉션합니다.

## 프로젝트 유지 관리

- **의존성 업데이트**: `npm outdated` 명령을 실행하여 업데이트가 필요한 패키지를 확인하고, `npm update` 명령으로 업데이트할 수 있습니다.
- **테스트**: `npm test -- --passWithNoTests` 명령으로 테스트를 실행합니다.
- **프로덕션 빌드**: `npm run build` 명령으로 최적화된 프로덕션 빌드를 생성합니다.

# Taxcredit Visual

### 최종 점검 타임스탬프: 2025-04-30 19:45

Azure App Service 배포를 위한 GitHub Actions 워크플로우 설정 검증 - Client ID 수정 후 재시도
