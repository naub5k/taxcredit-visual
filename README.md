# DB 필터링 과정 시각화 앱

이 프로젝트는 데이터베이스 필터링 과정을 시각적으로 보여주는 React 기반 웹 애플리케이션입니다.

<!-- 배포 테스트용 변경 - 2025.04.25 -->
<!-- 테스트 2 - 명확한 변경 추가 -->

## 업데이트 내역
- 2025.04.25: 배포 프로세스 개선 및 테스트
- 2025.05.02: 프로젝트 폴더 구조 정리 및 재구성

## 프로젝트 기술 스택

- **프론트엔드 프레임워크**: React 18
- **UI 스타일링**: TailwindCSS
- **차트 라이브러리**: Recharts
- **배포 환경**: Azure Web App
- **배포 방식**: Git 직접 배포 (azure 리모트)

## 프로젝트 구조

```
taxcredit_mobileapp/                # 프로젝트 최상위 디렉토리
├── my-app/                         # React 앱 본체
│   ├── .github/workflows/          # GitHub Actions 워크플로우 설정 (백업용)
│   ├── build/                      # 빌드 결과물 (배포용)
│   ├── cursor_requests/            # Cursor AI와의 협업 요청 파일
│   │   └── 작업요청서_YYYY-MM-DD_###.md  # 작업 요청 문서
│   ├── public/                     # 정적 파일
│   ├── src/
│   │   ├── components/             # React 컴포넌트
│   │   │   ├── FunnelChart.jsx     # 깔때기형 차트 컴포넌트
│   │   │   └── RegionList.jsx      # 지역 목록 컴포넌트
│   │   ├── data/                   # 데이터 모델
│   │   │   └── dummyRefinementData.js # 샘플 데이터
│   │   ├── App.js                  # 메인 앱 컴포넌트
│   │   └── index.js                # 진입점
│   ├── .gitignore                  # Git 무시 파일 목록
│   ├── package.json                # 의존성 및 스크립트 정의
│   ├── postcss.config.js           # PostCSS 설정
│   └── tailwind.config.js          # TailwindCSS 설정
│
├── scripts/                        # 모든 자동화 스크립트
│   ├── deploy.ps1                  # Azure 배포 PowerShell 스크립트
│   ├── deploy-static.ps1           # 정적 파일 배포 스크립트
│   ├── setup-git-deploy.ps1        # Git 배포 초기 설정 스크립트
│   └── ...                         # 기타 자동화 스크립트
│
├── docs/                           # 문서 및 가이드
│   ├── PROJECT_STRUCTURE.md        # 프로젝트 구조 문서
│   ├── GIT_DEPLOY_GUIDE.md         # Git 배포 가이드
│   ├── 작업_결과_보고서.md          # 작업 결과 보고서
│   └── ...                         # 기타 문서
│
├── archives/                       # 배포 산출물 및 로그
│   ├── deploy-log-*.txt            # 배포 로그 파일
│   ├── *.zip                       # 배포 및 빌드 zip 파일
│   └── ...                         # 기타 아카이브 파일
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
   npm install
   ```

3. 개발 서버 실행:
   ```bash
   npm start
   ```
   애플리케이션이 http://localhost:3000 에서 실행됩니다.

## 배포 방법

이 프로젝트는 두 가지 배포 방식을 지원합니다:

### 1. Git 기반 소스 배포 (기존 방식)

Git을 통한 직접 배포 방식을 사용합니다:

1. 배포 스크립트를 사용하여 Azure에 배포:
   ```bash
   npm run deploy
   ```
   이 명령은 PowerShell 스크립트 `deploy.ps1`을 실행하여 변경사항을 자동으로 커밋하고 Azure에 배포합니다.
   스크립트는 커밋 메시지를 입력받은 후 Azure 원격 저장소로 푸시합니다.

2. Azure는 자동으로 코드를 빌드하고 웹 앱을 업데이트합니다.
   - 단점: 매번 Azure 서버에서 npm install과 빌드가 진행되어 배포 시간이 깁니다.

### 2. 정적 빌드 파일 배포 (권장)

**권장 방식**: 로컬에서 빌드하고 빌드 결과물만 배포합니다:

1. 로컬에서 애플리케이션을 빌드하고 정적 파일만 배포:
   ```bash
   npm run deploy:static
   ```
   이 명령은 다음 작업을 자동으로 수행합니다:
   - 로컬에서 `npm run build` 실행
   - build 폴더의 내용을 zip으로 압축
   - Azure에 직접 정적 파일 배포 (빌드 과정 없이)

2. 배포 시간이 몇 초로 단축됩니다.
   - 장점: 빠른 배포, 빌드 실패 위험 없음
   - 참고: 처음 실행시 Azure 배포 자격 증명을 입력해야 합니다.

배포된 애플리케이션은 다음 URL에서 접근 가능합니다:
- https://taxcredit-visual.azurewebsites.net

### Azure Git 배포 설정 (최초 1회)

Azure remote를 설정하지 않은 경우 다음 명령어로 추가합니다:
```bash
git remote add azure https://사용자명@taxcredit-visual.scm.azurewebsites.net/taxcredit-visual.git
```

### SPA 라우팅

이 앱은 Single Page Application으로, `staticwebapp.config.json` 파일을 통해 Azure에서 라우팅을 설정합니다. 이 파일은 모든 라우트를 `index.html`로 리디렉션합니다.

## 프로젝트 유지 관리

- **의존성 업데이트**: `npm outdated` 명령을 실행하여 업데이트가 필요한 패키지를 확인하고, `npm update` 명령으로 업데이트할 수 있습니다.
- **프로덕션 빌드**: `npm run build` 명령으로 최적화된 프로덕션 빌드를 생성합니다. 

## Cursor 작업 요청

Cursor AI에 작업을 요청하려면 `cursor_requests` 폴더에 요청서를 작성합니다:

1. 파일 형식: `작업요청서_YYYY-MM-DD_순번.md`
2. 요청 처리 후 결과는 `작업요청서_YYYY-MM-DD_순번_result.md`에 기록됩니다.
3. 작업 요청서는 다음과 같은 내용을 포함해야 합니다:
   - 요청 개요
   - 세부 요청 항목
   - 수행해야 할 작업에 대한 명확한 설명

작업 요청은 프로젝트의 효율적인 개발과 관리를 위한 협업 도구로 활용됩니다. 