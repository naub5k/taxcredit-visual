# Azure App Service Health Check 배포 보고서

## 문제 상황
Azure App Service에서 "/health" 경로의 상태 확인 설정이 활성화되어 있으나, 애플리케이션이 이에 대응하지 못해 건강 상태 검사에 실패하고 있었습니다.

## 해결 방법
React 정적 SPA 애플리케이션의 경우 두 가지 해결 방법이 있습니다:

1. public/ 디렉토리에 "health" 정적 파일 생성
2. web.config 내 `/health` 경로를 index.html로 rewrite하는 규칙 추가

이 중 첫 번째 방법을 선택했습니다. 이유는 다음과 같습니다:
- 간단하고 직관적인 방법
- 추가 설정이 필요 없음
- 정적 파일이므로 리소스 부하가 적음

## 구현 내용
`public/health` 파일을 생성하고 다음 내용을 포함했습니다:
```
OK
```

이 파일은 React 빌드 과정에서 그대로 build 디렉토리에 복사되어 Azure App Service에 배포됩니다.

## 배포 결과
- GitHub 저장소: https://github.com/naub5k/taxcredit-visual
- 배포된 Azure App Service: https://taxcredit-visual.azurewebsites.net
- Health Check URL: https://taxcredit-visual.azurewebsites.net/health

배포 후 `/health` 엔드포인트에 접근했을 때 HTTP 200 OK 응답과 함께 "OK" 텍스트가 반환되는 것을 확인했습니다.

## 검증 방법
다음 방법으로 health check 작동을 검증했습니다:
```
curl -I https://taxcredit-visual.azurewebsites.net/health
```

응답:
```
HTTP/1.1 200 OK
```

## 마무리
이제 Azure App Service의 자동 health check가 정상적으로 작동하여 애플리케이션이 정상 상태로 유지됩니다. 이 설정으로 인해 인스턴스가 비정상으로 간주되어 자동 교체되는 문제가 해결되었습니다. 