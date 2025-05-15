# Azure Portal에서 Static Web Apps 데이터베이스 연결 설정 가이드

Static Web Apps의 데이터베이스 연결 기능을 사용하기 위해서는 **코드 상의 설정**뿐만 아니라 **Azure Portal에서의 연결 설정도 필수적**입니다. 현재 발생하는 400 오류는 데이터베이스 연결이 Portal에서 완전히 구성되지 않았음을 의미합니다.

## 1. Azure Portal에서 데이터베이스 연결 설정하기

1. [Azure Portal](https://portal.azure.com)에 로그인합니다.
2. Static Web App 리소스(polite-desert-03a31df00)로 이동합니다.
3. 좌측 메뉴의 **설정** 섹션에서 **데이터베이스 연결**을 선택합니다.
4. **+ 기존 데이터베이스 연결**을 클릭합니다.
5. 다음과 같이 설정합니다:
   - **데이터베이스 유형**: Azure SQL Database 선택
   - **구독**: 해당 데이터베이스가 있는 구독 선택
   - **리소스 이름**: `naub5k` 서버 선택
   - **데이터베이스 이름**: `CleanDB` 선택
   - **인증 유형**: 연결 문자열 선택
   - **사용자 이름**: `naub5k`
   - **암호**: `dunkin3106UB!`
6. **확인**을 클릭하여 연결을 완료합니다.

![Azure Portal Database Connection](https://learn.microsoft.com/ko-kr/azure/static-web-apps/media/database-configuration/azure-portal-database-connection.png)

## 2. 연결 확인하기

연결 설정 후에는 Static Web App이 자동으로 다시 시작될 수 있습니다. 이 과정이 완료될 때까지 기다린 후:

1. **데이터베이스 연결** 페이지에서 연결 상태가 '연결됨'으로 표시되는지 확인
2. 브라우저에서 `/api-test` 페이지를 다시 방문하여 API 테스트

## 3. Function API 문제 해결

Function API 오류(`<!doctype html>` 응답)는 Azure Static Web Apps가 API 요청을 내부 Function App으로 적절히 라우팅하지 못하는 문제입니다.

확인 사항:
1. Function App(taxcredit-api-func-v2)이 실제로 배포되어 실행 중인지 확인
2. Static Web App 구성 파일의 API 경로가 올바른지 확인

## 4. 로컬 테스트 시도

1. 로컬에서 Static Web Apps CLI로 테스트:
   ```bash
   npm install -g @azure/static-web-apps-cli
   set DATABASE_CONNECTION_STRING=Server=naub5k.database.windows.net;Database=CleanDB;User Id=naub5k;Password=dunkin3106UB!;Encrypt=true
   swa start my-app/build --data-api-location swa-db-connections
   ```

2. 로컬 브라우저에서 확인:
   ```
   http://localhost:4280/api-test
   ```

## 5. 주의 사항

- **환경 변수**: 데이터베이스 연결 문자열이 Azure에 올바르게 설정되었는지 확인
- **권한**: SQL 서버 방화벽이 Azure Static Web Apps 서비스에 접근을 허용하는지 확인
- **배포**: 모든 설정 변경 후 GitHub 워크플로우 실행이 완료될 때까지 기다림

## 6. 문제 지속 시 로그 확인

Azure Portal에서 Static Web App 로그를 확인하여 더 자세한 오류 정보를 확인할 수 있습니다:

1. Static Web App 리소스 > "모니터링" 섹션 > "로그"
2. 쿼리를 사용하여 오류 메시지 필터링 