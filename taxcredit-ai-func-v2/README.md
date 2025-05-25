# taxcredit-ai-func-v2

세무 크레딧 AI 기능을 제공하는 Azure Functions 앱입니다.

## 기능

이 함수는 다음 API 모델을 지원합니다:

1. **GPT**: OpenAI GPT-3.5 Turbo 모델을 사용한 응답 생성
2. **Gemini**: Google Gemini 모델을 사용한 응답 생성
3. **Search**: SerpAPI를 사용한 검색 결과 요약

## 로컬 테스트

1. API 키 설정:
   `local.settings.json` 파일에 필요한 API 키를 입력하세요.

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AzureWebJobsStorage": "UseDevelopmentStorage=true", 
       "OPENAI_API_KEY": "your-openai-api-key", 
       "SERPAPI_KEY": "your-serpapi-key", 
       "GEMINI_API_KEY": "your-gemini-api-key"
     }
   }
   ```

2. 함수 로컬 실행:
   ```bash
   npm start
   ```

3. 테스트 실행:
   ```bash
   npm test
   ```

## Azure 배포

현재 함수는 `taxcredit-ai-func-v2` 함수앱에 배포되어 있습니다. 코드 업데이트 배포:

```bash
# 배포
npm run deploy

# 또는 스테이징 환경 배포
npm run deploy:staging
```

## API 환경변수 설정

Azure Portal에서 직접 설정하거나 다음 명령으로 설정할 수 있습니다:

```bash
# 환경변수 설정 (실제 키 값 입력 필요)
az functionapp config appsettings set --name taxcredit-ai-func-v2 --resource-group taxcredit-ai-rg --settings OPENAI_API_KEY=your-key SERPAPI_KEY=your-key GEMINI_API_KEY=your-key
```

## API 엔드포인트

함수 URL 확인:
```bash
npm run get-url
```

## API 사용 예시

```javascript
// 요청 예시
fetch("https://taxcredit-ai-func-v2.azurewebsites.net/api/aimodelquery", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt", // "gpt", "gemini", "search" 중 선택
    input: "세무사무소의 주요 업무는 무엇인가요?"
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

## 문제 해결

- 함수가 작동하지 않는 경우 Azure Portal에서 로그를 확인하세요.
- CORS 오류가 발생하면 함수 앱의 CORS 설정을 확인하세요.
- API 키가 올바르게 설정되었는지 확인하세요. 