# 세무 크레딧 AI 함수 개발 문서

**작성일**: 2025-05-14  
**프로젝트**: taxcredit_mobileapp  
**구성요소**: taxcredit-ai-func-v2 (Azure Functions)

## 1. 프로젝트 개요

세무 크레딧 모바일 앱을 위한 AI 기능을 제공하는 Azure Functions 앱입니다. 이 함수는 다양한 AI 모델을 활용하여 세무 관련 질문 응답, 사업장 정보 검색 및 요약 기능을 제공합니다.

## 2. 구현된 기능

### 2.1 지원 모델

1. **GPT 모델**: OpenAI의 GPT-3.5 Turbo를 사용하여 세무 관련 질문에 답변
2. **Gemini 모델**: Google의 Gemini 모델을 사용 시도했으나 API 호환성 문제로 GPT로 대체 실행
3. **Search 모델**: SerpAPI를 통해 검색 결과를 가져온 후 GPT로 요약

### 2.2 API 엔드포인트

- `POST /api/aimodelquery`
  - 요청 형식: `{ "model": "모델명", "input": "질문 내용" }`
  - 응답 형식: `{ "result": "응답 결과", "notice": "알림 메시지(선택적)" }`

## 3. 코드 구조

### 3.1 주요 파일

| 파일 | 설명 |
|------|------|
| `src/aimodelquery/index.js` | 메인 함수 코드 (API 요청 처리) |
| `aiModelQuery/function.json` | 함수 바인딩 설정 |
| `package.json` | 의존성 및 스크립트 설정 |
| `host.json` | Azure Functions 호스트 설정 |
| `local.settings.json` | 로컬 환경 설정 (API 키 등) |

### 3.2 유틸리티 파일

모바일 앱에서 Azure Functions를 호출하기 위한 유틸리티:

| 파일 | 설명 |
|------|------|
| `my-app/src/utils/aiService.js` | 앱에서 AI 기능 호출을 위한 유틸리티 |

### 3.3 테스트 및 배포 도구

| 파일 | 설명 |
|------|------|
| `test.js` | 기본 테스트 스크립트 |
| `detailed-azure-test.js` | 상세 테스트 및 오류 정보 확인 스크립트 |
| `key-test.js` | API 키 유효성 테스트 도구 |
| `deploy-and-test.js` | 배포 및 테스트 자동화 스크립트 |
| `set-env-and-test.bat` | 환경 변수 설정 및 테스트 배치 스크립트 |
| `set-env-and-test.ps1` | 환경 변수 설정 및 테스트 PowerShell 스크립트 |

## 4. 개발 및 문제 해결 과정

### 4.1 초기 설정 문제

- `main` 필드 오류: package.json의 `main` 필드가 잘못된 경로를 가리키고 있어 함수 실행 실패
  - 해결: `"src/functions/*.js"` → `"src/aimodelquery/index.js"`로 수정

### 4.2 API 키 관리

- 로컬과 Azure 환경의 분리: 로컬 테스트 중 API 키를 가져오지 못하는 문제
  - 해결: 로컬 환경에서 테스트할 때 환경 변수를 직접 설정하는 스크립트 생성

### 4.3 모델별 문제 해결

1. **GPT 모델**: 초기에 정상 작동
2. **Gemini 모델**: API 버전 호환성 문제 발생
   - 시도 1: `gemini-pro` → `gemini-1.5-pro` 모델로 변경
   - 시도 2: 다양한 API 버전 시도
   - 최종 해결: GPT 모델로 대체 실행하도록 변경 (notice 필드 추가)
3. **Search 모델**: SerpAPI 응답 구조 예상과 다름
   - 해결: `local_results` → `organic_results` 사용으로 변경
   - 데이터 없는 경우 처리 개선

### 4.4 CORS 문제

- 브라우저에서 직접 API 호출 시 CORS 오류 발생
  - 해결: 모든 응답에 CORS 헤더 추가, OPTIONS 메서드 지원 추가

## 5. 사용 방법

### 5.1 로컬 개발 환경 설정

1. 필요한 API 키 준비:
   - OpenAI API 키 (필수)
   - SerpAPI 키 (검색 기능 사용 시 필요)
   - Gemini API 키 (현재는 사용하지 않음)

2. `local.settings.json` 설정:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "OPENAI_API_KEY": "your-openai-key",
       "SERPAPI_KEY": "your-serpapi-key",
       "GEMINI_API_KEY": "your-gemini-key"
     }
   }
   ```

3. 로컬 실행:
   ```bash
   npm start
   ```

4. 테스트:
   ```bash
   npm run test:simple
   ```

### 5.2 Azure 배포

1. 배포 명령어:
   ```bash
   npm run deploy
   ```

2. 함수 앱 재시작:
   ```bash
   npm run restart-func
   ```

3. 환경 변수 설정 (Azure Portal):
   - 함수 앱 > 구성 > 애플리케이션 설정에서 API 키 설정

4. 배포 테스트:
   ```bash
   npm run test:azure:detail
   ```

### 5.3 앱에서 사용 방법

`aiService.js` 파일을 앱 프로젝트에 포함시키고 다음과 같이 사용:

```javascript
import { askGpt, askGemini, searchAndSummarize } from '../utils/aiService';

// GPT 모델 사용 예시
async function handleAskGpt() {
  const answer = await askGpt("세무사무소의 주요 업무는 무엇인가요?");
  console.log(answer);
}

// 검색 및 요약 기능 사용 예시
async function handleSearch() {
  const summary = await searchAndSummarize("서울시 강남구 세무사무소");
  console.log(summary);
}
```

## 6. 향후 개선 사항

1. **Gemini 모델 통합 복구**:
   - Google Gemini API 버전이 안정화되면 다시 통합 시도
   - API 키 권한 문제 확인 및 해결

2. **로그 개선**:
   - Azure Application Insights 연동 강화
   - 상세한 로깅 및 모니터링 체계 구축

3. **에러 처리 강화**:
   - 더 세밀한 오류 처리 및 사용자 친화적인 오류 메시지

4. **성능 최적화**:
   - 캐싱 메커니즘 추가하여 반복되는 질문에 대해 빠른 응답 제공

5. **보안 강화**:
   - API 키 관리 개선
   - 프로덕션 환경에서의 인증 메커니즘 추가

## 7. 참고 사항

- Gemini API는 현재 기술적 문제로 GPT로 대체 실행됩니다.
- SerpAPI는 검색 결과를 항상 보장하지 않으며, 결과가 없는 경우에 대한 처리가 구현되어 있습니다.
- CORS 설정은 현재 모든 오리진을 허용하도록 되어 있으나, 보안을 위해 프로덕션 환경에서는 특정 오리진만 허용하도록 변경하는 것이 좋습니다.

## 8. 명령어 모음

```bash
# 로컬 실행
npm start

# 다른 포트로 실행
npm run start:alt

# 테스트
npm run test:simple      # 간단한 테스트
npm run test:azure       # Azure 배포 테스트
npm run test:azure:detail # 상세 Azure 테스트
npm run test:keys        # API 키 테스트

# 환경 변수 설정 및 테스트
npm run test:with-env    # CMD용
npm run test:with-env:ps # PowerShell용

# 배포
npm run deploy           # 배포
npm run restart-func     # 함수 앱 재시작
npm run deploy-and-test  # 배포 및 테스트 자동화
``` 