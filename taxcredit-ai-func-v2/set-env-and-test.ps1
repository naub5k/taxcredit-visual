Write-Host "===== API 키 환경 변수 설정 및 테스트 =====" -ForegroundColor Green

# Azure Portal에서 복사한 API 키를 입력하세요.
$env:OPENAI_API_KEY = "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"
$env:GEMINI_API_KEY = "AIzaSyD4DLPcF_LnEqn_a4F7J2q74icQYLWIfPE"
$env:SERPAPI_KEY = "6b49c0236be89b6387c821eb68127aa3476ba741cb25c748e35f2f2e3ecf367d"

Write-Host "환경 변수가 설정되었습니다." -ForegroundColor Cyan
Write-Host ""

# API 키 테스트 실행
Write-Host "테스트 실행 중..." -ForegroundColor Yellow
node key-test.js

Write-Host ""
Write-Host "테스트가 완료되었습니다. 아무 키나 눌러 종료하세요..." -ForegroundColor Green
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null 