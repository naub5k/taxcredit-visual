# Azure Function 배포 스크립트
Write-Host "=== getSampleList Azure Function 배포 시작 ===" -ForegroundColor Green

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "현재 디렉토리: $currentDir" -ForegroundColor Yellow

# 필요한 파일들 확인
$requiredFiles = @(
    "getSampleList/index.js",
    "getSampleList/function.json",
    "utils/db-utils.js",
    "host.json",
    "package.json"
)

Write-Host "필요한 파일들 확인 중..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (누락)" -ForegroundColor Red
    }
}

# package.json 확인
if (Test-Path "package.json") {
    Write-Host "package.json 내용:" -ForegroundColor Yellow
    Get-Content "package.json" | Write-Host
} else {
    Write-Host "package.json 생성 중..." -ForegroundColor Yellow
    @"
{
  "name": "taxcredit-api-func-v2",
  "version": "1.0.0",
  "description": "Tax Credit API Functions",
  "main": "index.js",
  "dependencies": {
    "mssql": "^9.1.1"
  },
  "scripts": {
    "start": "func start"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8
    Write-Host "✅ package.json 생성 완료" -ForegroundColor Green
}

# host.json 확인
if (Test-Path "host.json") {
    Write-Host "host.json 내용:" -ForegroundColor Yellow
    Get-Content "host.json" | Write-Host
} else {
    Write-Host "host.json 생성 중..." -ForegroundColor Yellow
    @"
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[2.*, 3.0.0)"
  }
}
"@ | Out-File -FilePath "host.json" -Encoding UTF8
    Write-Host "✅ host.json 생성 완료" -ForegroundColor Green
}

# function.json 확인
$functionJsonPath = "getSampleList/function.json"
if (Test-Path $functionJsonPath) {
    Write-Host "function.json 내용:" -ForegroundColor Yellow
    Get-Content $functionJsonPath | Write-Host
} else {
    Write-Host "function.json 생성 중..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "getSampleList" -Force | Out-Null
    @"
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post", "options"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
"@ | Out-File -FilePath $functionJsonPath -Encoding UTF8
    Write-Host "✅ function.json 생성 완료" -ForegroundColor Green
}

Write-Host "`n=== 배포 준비 완료 ===" -ForegroundColor Green
Write-Host "다음 명령어로 Azure에 배포하세요:" -ForegroundColor Yellow
Write-Host "func azure functionapp publish taxcredit-api-func-v2" -ForegroundColor Cyan

Write-Host "`n=== 로컬 테스트 ===" -ForegroundColor Green
Write-Host "로컬 테스트를 위해 다음 명령어를 실행하세요:" -ForegroundColor Yellow
Write-Host "func start" -ForegroundColor Cyan
Write-Host "테스트 URL: http://localhost:7071/api/getSampleList?sido=서울특별시&gugun=강남구&page=1&pageSize=10" -ForegroundColor Cyan 