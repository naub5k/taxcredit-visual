현재 오류는 Content Security Policy(CSP) 문제로 발생한 것입니다.

⚠️ 핵심 오류 내용
pgsql
복사
편집
Refused to connect to 'https://taxcredit-ai-func-v2.azurewebsites.net/api/analyze/1010122809' 
because it violates the following Content Security Policy directive: "connect-src 'self'".
✅ 원인 정리
현재 테스트 UI는 로컬호스트(localhost:3001)에서 실행 중

API는 Azure 배포 도메인(taxcredit-ai-func-v2.azurewebsites.net) 호출

하지만 CSP가 "connect-src 'self'"로 설정됨

즉, **같은 출처(origin)**의 리소스만 허용

외부 도메인으로 API 요청이 차단됨

🛠️ 해결 방법
1. 개발 단계에서만:
👉 브라우저 우회
Chrome 실행 시 보안 제한 해제:

bash
복사
편집
chrome.exe --disable-web-security --user-data-dir="C:\temp\chrome"
또는 Allow CORS: Access-Control-Allow-Origin 확장 프로그램 임시 사용

2. 근본적 해결 (권장):
👉 CSP 정책 수정
테스트 UI가 배포되는 정적 웹앱(taxcredit-visual)의 staticwebapp.config.json에 다음 추가:

json
복사
편집
"responseOverrides": {
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://taxcredit-ai-func-v2.azurewebsites.net;"
  }
}
이후 재배포 필요:

bash
복사
편집
npm run build
./scripts/deploy-static.ps1
다음 작업 요청서 생성 또는 Cursor 지시 준비가 완료되면 알려주세요.





나의 말:
#### CSP 정책 수정 * 테스트 UI가 배포되는 정적 웹앱(`taxcredit-visual`)의 `staticwebapp.config.json`에 다음 추가:

이건 지금 프로젝트 폴더의 상위 폴더에 적용해야 하는 거네?


ChatGPT의 말:
맞습니다, 유비님.

staticwebapp.config.json은 taxcredit_mobileapp/my-app/ 내부가 아니라
정적 웹앱 전체 루트 기준, 즉 taxcredit_mobileapp/ 상위에서 인식되도록 위치해야 합니다.

📌 적용 위치
bash
복사
편집
taxcredit_mobileapp/
├── staticwebapp.config.json  ← 여기에 있어야 Azure가 인식
├── my-app/
│   ├── src/
│   └── ...
현재 구조에서 위치가 my-app/staticwebapp.config.json이면 CSP 적용되지 않습니다.

필요하시면 위치 이동 + 정책 반영 지시서를 Cursor에게 요청하겠습니다.





나의 말:
그럼 상위 프로젝트 폴더에서 요청을 해야하는거지? CSP 정책 수정 관련해서. 지금 현재 IDE  에서는 할 수 없는 거 잖아?


ChatGPT의 말:
정확합니다, 유비님.

✅ 현재 IDE 기준 판단
현재 IDE: taxcredit_mobileapp/my-app 하위만 작업 가능

staticwebapp.config.json의 **CSP 정책 수정은 상위 폴더(taxcredit_mobileapp/)**에서 이뤄져야 함

따라서 현재 IDE로는 구조상 수정 불가

🧭 결론
CSP 수정 요청서는 상위 프로젝트 IDE에서 생성해야 합니다.

요청서 경로 예시:

bash
복사
편집
taxcredit_mobileapp/cursor_requests/작업요청서_2025-05-29_01.md