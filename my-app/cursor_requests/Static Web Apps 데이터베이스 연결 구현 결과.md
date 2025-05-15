# Azure Static Web Apps 데이터베이스 연결 구현 결과

**작성일**: 2025-05-15  
**업데이트**: 2025-05-16  
**프로젝트**: taxcredit_mobileapp  
**담당**: Cursor AI

## 1. 구현 결과 요약

Azure Static Web Apps의 데이터베이스 연결 기능을 활용하여 기존 API 함수(api-func)의 기능을 대체하는 코드 패턴을 구현했습니다. 이를 통해 중간 계층 코드 작성 없이도 데이터베이스에 직접 접근할 수 있게 되어 개발/유지보수 효율성이 향상되었습니다.

## 2. 변경 파일 목록

- **신규 파일**:
  - `swa-db-connections/staticwebapp.database.config.json` - 데이터베이스 연결 구성
  - `my-app/src/utils/dataApiService.js` - 데이터 API 유틸리티
  - `my-app/src/components/DataApiSample.js` - 샘플 컴포넌트
  - `my-app/src/components/DataApiTest.js` - API 테스트 컴포넌트

- **수정 파일**:
  - `.github/workflows/azure-static-web-apps-polite-desert-03a31df00.yml` - 워크플로우 수정
  - `README.md` - 문서 업데이트
  - `my-app/src/App.js` - API 테스트 라우트 추가

## 3. 구현된 기능

### 3.1 데이터베이스 연결 구성

`staticwebapp.database.config.json` 파일을 통해 다음 기능을 구성했습니다:

- **SQL 데이터베이스 연결**: Azure SQL 데이터베이스에 직접 연결
- **엔티티 모델링**: `Insu_sample` 테이블을 `Sample` 및 `InsuCompany` 엔티티로 매핑
- **API 엔드포인트**: REST 및 GraphQL 엔드포인트 활성화
- **보안 설정**: 익명 액세스 허용 (기존 API와 동일한 수준)

### 3.2 클라이언트 API 서비스

`dataApiService.js` 파일에서 다음 기능을 제공합니다:

- **샘플 데이터 조회**: 시도/구군 필터링 지원
- **REST API 호출**: OData 형식의 필터링 쿼리 구성
- **GraphQL 호출**: 대체 방식으로 GraphQL 쿼리 지원
- **환경 감지**: 개발/프로덕션 환경 자동 감지 및 URL 구성

### 3.3 예제 컴포넌트

`DataApiSample.js` 컴포넌트를 통해 다음 기능을 보여줍니다:

- **필터링 UI**: 시도/구군 검색 폼 제공
- **결과 테이블**: 조회 결과를 테이블로 표시
- **API 전환**: REST와 GraphQL 간 전환 기능 제공
- **상태 관리**: 로딩/에러 상태 관리

### 3.4 API 테스트 도구 (신규)

`DataApiTest.js` 컴포넌트는 다음 기능을 제공합니다:

- **API 비교 테스트**: 데이터 API와 기존 API Function 간 성능 및 기능 비교
- **응답 시간 측정**: 각 API 호출의 응답 시간을 밀리초 단위로 표시
- **테이블 뷰**: 조회 결과를 정리된 테이블로 표시
- **API 전환 기능**: 두 API 모드 간 쉬운 전환

## 4. 로컬 개발 환경 설정

로컬에서 개발 및 테스트를 위한 설정 방법:

1. Static Web Apps CLI 설치:
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

2. 데이터베이스 연결 문자열 설정:
   ```bash
   # Windows
   set DATABASE_CONNECTION_STRING=Server=naub5k.database.windows.net;Database=CleanDB;User Id=naub5k;Password=dunkin3106UB!;Encrypt=true
   
   # Linux/Mac
   export DATABASE_CONNECTION_STRING=Server=naub5k.database.windows.net;Database=CleanDB;User Id=naub5k;Password=dunkin3106UB!;Encrypt=true
   ```

3. 로컬 개발 서버 실행:
   ```bash
   swa start my-app/build --data-api-location swa-db-connections
   ```

## 5. 배포 방법

GitHub Actions 워크플로우를 통해 자동 배포됩니다:

1. `data_api_location` 속성 추가:
   ```yaml
   data_api_location: "swa-db-connections"
   ```

2. Azure Portal에서 데이터베이스 연결 구성:
   - Static Web App 리소스 > 설정 > 데이터베이스 연결
   - 기존 데이터베이스 연결 선택
   - 필요한 인증 정보 입력

## 6. 기존 API와의 비교

| 측면 | Azure Functions API | Static Web Apps DB 연결 |
|------|----------------------|--------------------------|
| 코드량 | 많음 (API 코드 작성 필요) | 적음 (구성 파일만 필요) |
| 유지보수 | 복잡함 (여러 파일) | 간단함 (단일 구성 파일) |
| 보안 | 직접 구현 필요 | 기본 제공 (권한 설정) |
| 확장성 | 유연함 (세부 커스터마이징) | 제한적 (기본 CRUD만 지원) |
| 로컬 개발 | 복잡함 (func 실행 필요) | 간단함 (swa CLI) |

## 7. API 테스트 도구 사용법

API 성능 및 기능을 테스트하려면:

1. 애플리케이션에서 `/api-test` 경로로 이동
2. "API 전환" 버튼을 클릭하여 데이터 API와 기존 Function API 간 전환
3. "데이터 가져오기" 버튼을 클릭하여 API 호출 테스트
4. 데이터 로딩 시간을 비교하여 성능 차이 확인
5. 결과 데이터의 형식과 내용을 비교하여 정확성 확인

## 8. 확장 가능성

향후 개선 가능한 부분:

- **인증/권한 적용**: 역할 기반 권한 관리
- **추가 엔티티 정의**: 다른 테이블도 동일 패턴으로 노출
- **GraphQL 스키마 확장**: 다양한 데이터 쿼리 패턴 지원
- **조건부 액세스**: 보안 규칙을 통한 접근 제어
- **자동화된 벤치마크**: API 성능 비교를 위한 자동화된 도구 개발

## 9. 참고 사항

- 기존 API(api-func)는 유지하되, 새로운 기능부터 데이터베이스 연결 방식 적용 권장
- Azure Portal에서 데이터베이스 연결 상태 모니터링 가능
- 데이터베이스 스키마 변경 시 구성 파일 업데이트 필요 