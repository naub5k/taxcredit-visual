# API 호출 구조 복원 가이드

## 1. 복원된 API 호출 구조

- RegionDetailPage.js의 API 호출 구조를 개발/배포 환경에 따라 분기하도록 복원했습니다.
- 개발 환경(localhost)에서는 로컬 API(`http://localhost:7071`)를 호출합니다.
- 배포 환경에서는 Azure API(`https://taxcredit-api-func-v2.azurewebsites.net`)를 호출합니다.

## 2. 복원된 구조의 이점

### 개발 효율성 향상
- `npm start + func start` 조합으로 로컬 개발 및 즉시 테스트 가능
- 코드 수정 시 실시간으로 변경사항 확인 가능
- 로컬 API 연동으로 디버깅 용이

### 배포 안정성 유지
- 배포 환경에서는 여전히 안정적인 Azure API 사용
- 개발/운영 환경 분리를 통한 안정성 확보

## 3. 올바른 개발 방법

### 로컬 개발 및 테스트
```
# 터미널 1: Azure Functions 실행
cd taxcredit_mobileapp
func start

# 터미널 2: React 개발 서버 실행
cd taxcredit_mobileapp/my-app
npm start
```

### 배포용 빌드
```
# 배포용 빌드
cd taxcredit_mobileapp/my-app
npm run build
```

## 4. 주의사항

1. **로컬 API 필수**: 로컬 개발 시 `func start`가 반드시 실행 중이어야 합니다.
2. **프로세스 관리**: Azure Functions 실행 오류 시 프로세스를 완전히 종료 후 재시작하세요.
3. **환경 확인**: 개발 중 API 호출 URL이 의도한 환경과 일치하는지 콘솔로 확인하세요.

> 이 변경으로 개발 테스트를 위한 구조적 복원이 완료되었습니다. 