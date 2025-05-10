# git-cleanup.ps1

Write-Host "`n🚀 Git node_modules 정리 스크립트 시작" -ForegroundColor Cyan

# 경로 설정
$gitPath = "D:\Program Files\Git\cmd\git.exe"
$repoPath = Get-Location

# 1. .gitignore 존재 여부 확인
$gitignorePath = Join-Path $repoPath ".gitignore"
if (-Not (Test-Path $gitignorePath)) {
    Write-Host ".gitignore 파일이 없습니다. 생성합니다..." -ForegroundColor Yellow
    "node_modules/" | Out-File -Encoding utf8 $gitignorePath
} else {
    $ignoreContent = Get-Content $gitignorePath
    if ($ignoreContent -notcontains "node_modules/" -and $ignoreContent -notcontains "**/node_modules/") {
        Add-Content $gitignorePath "`nnode_modules/"
        Add-Content $gitignorePath "**/node_modules/"
        Write-Host ".gitignore에 node_modules 항목 추가 완료" -ForegroundColor Green
    } else {
        Write-Host ".gitignore에 node_modules 관련 규칙 이미 존재" -ForegroundColor Gray
    }
}

# 2. Git 추적 여부 확인
$tracked = & $gitPath ls-files | Select-String "node_modules"
if ($tracked) {
    Write-Host "Git이 node_modules를 추적 중입니다. 캐시에서 제거합니다..." -ForegroundColor Yellow
    & $gitPath rm -r --cached node_modules | Out-Null
    & $gitPath commit -m "chore: remove node_modules from tracking" | Out-Null
    Write-Host "✅ node_modules 제거 및 커밋 완료" -ForegroundColor Green
} else {
    Write-Host "Git이 node_modules를 추적하지 않습니다. 정리 완료!" -ForegroundColor Green
}

Write-Host "`n🎉 작업 완료. .gitignore 및 Git 상태가 정리되었습니다.`n" -ForegroundColor Cyan
