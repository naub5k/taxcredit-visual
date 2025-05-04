# 고용이력부 앱 배포 가이드

이 문서는 고용이력부 앱을 Azure Static Web Apps에 배포하는 절차를 안내합니다.

## 배포 사전 준비

### 1. 환경 설정
- Node.js 18 이상, 20 이하 버전이 설치되어 있어야 합니다.
- Git이 설치되어 있어야 합니다.
- Azure 구독 및 Static Web App 리소스가 생성되어 있어야 합니다.

### 2. Azure 원격 저장소 설정
이미 설정되어 있다면 이 단계를 건너뛰어도 됩니다.

```bash
# Azure 원격 저장소 추가
git remote add azure https://your-azure-webapp-name.scm.azurewebsites.net:443/your-azure-webapp-name.git
```

## 배포 프로세스

### 1. 코드 변경 후 로컬 테스트
코드 변경 사항이 정상적으로 작동하는지 로컬에서 먼저 테스트합니다.

```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하여 앱이 정상 작동하는지 확인합니다.

### 2. 프로덕션 빌드
빌드 과정에서 `verify-build.js` 스크립트가 자동으로 실행되어 필수 파일 존재 여부를 검증합니다.

```bash
npm run build
```

### 3. Git 커밋
변경 사항을 Git에 커밋합니다.

```bash
git add .
git commit -m "UI 구조 개선 및 반응형 적용"
```

### 4. Azure 배포
간소화된 배포 명령어를 사용하여 Azure에 배포합니다.

```bash
npm run deploy
```

또는 직접 Git 명령어를 사용할 수도 있습니다.

```bash
git push azure HEAD:master
```

### 5. 배포 확인
Azure Portal에 접속하여 앱 서비스가 정상적으로 실행 중인지 확인합니다.

## 배포 시 주의사항

### build 폴더 처리
일반적으로 `build` 폴더는 Git에서 제외되지만, Azure 배포 시에는 필요할 수 있습니다. 다음과 같은 방법이 있습니다:

1. 특별히 `build` 폴더를 추가하는 방법:
   ```bash
   git add -f build
   ```

2. 현재는 `scripts/verify-build.js`가 필수 파일을 자동으로 검증하고 배포 환경에 필요한 설정 파일을 복사/생성합니다.

### .gitignore 설정
현재 `.gitignore` 파일에는 다음과 같은 설정이 있습니다:

```
# 프로덕션
# build 폴더는 일반적으로 git에서 제외하지만, 
# Azure 배포를 위해 필요시 git add -f build 사용
/build
build.zip
deploy.zip
```

## 문제 해결

### 1. 배포 후 공백 페이지가 표시되는 경우
- `staticwebapp.config.json` 파일이 빌드 폴더에 있는지 확인합니다.
- `web.config` 파일이 올바르게 설정되어 있는지 확인합니다.

### 2. 리소스 로딩 실패
- `package.json`의 `homepage` 설정이 `"."`로 되어 있는지 확인합니다.
- 상대 경로가 올바르게 사용되고 있는지 확인합니다.

### 3. 배포 명령어 실패
- Git이 올바르게 설정되어 있는지 확인합니다.
- Azure 원격 저장소 URL이 올바른지 확인합니다.

## 자동화 스크립트

### verify-build.js
이 스크립트는 빌드 폴더의 유효성을 검사하고 필요한 설정 파일을 추가합니다.

주요 기능:
- 빌드 폴더 존재 확인
- 필수 파일 존재 확인
- `staticwebapp.config.json` 파일이 없으면 루트에서 복사
- `web.config` 파일이 없으면 자동 생성

--- 

이 가이드가 고용이력부 앱의 배포 과정을 원활하게 진행하는 데 도움이 되기를 바랍니다. 