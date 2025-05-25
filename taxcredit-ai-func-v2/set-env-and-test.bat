@echo off
echo ===== API 키 환경 변수 설정 및 테스트 =====

REM Azure Portal에서 복사한 API 키를 입력하세요.
set OPENAI_API_KEY=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
set GEMINI_API_KEY=AIzaSyD4DLPcF_LnEqn_a4F7J2q74icQYLWIfPE
set SERPAPI_KEY=6b49c0236be89b6387c821eb68127aa3476ba741cb25c748e35f2f2e3ecf367d

echo 환경 변수가 설정되었습니다.
echo.

REM API 키 테스트 실행
echo 테스트 실행 중...
node key-test.js

echo.
echo 테스트가 완료되었습니다.
pause 