# fix-git-status.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "`n🚀 Git node_modules 추적 정리 스크립트 실행" -ForegroundColor Cyan

$gitPath = "D:\Program Files\Git\cmd\git.exe"
$repoPath = Get-Location
$gitignorePath = Join-Path $repoPath ".gitignore"

# 1. .gitignore 업데이트
if (-Not (Test-Path $gitignorePath)) {
    "node_modules/" | Out-File -Encoding utf8 $gitignorePath
    "**/node_modules/" | Add-Content $gitignorePath
    Write-Host ".gitignore 파일 생성 및 node_modules 항목 추가 완료" -ForegroundColor Green
} else {
    $content = Get-Content $gitignorePath
    $updated = $false
    if ($content -notcontains "node_modules/") {
        Add-Content $gitignorePath "node_modules/"
        $updated = $true
    }
    if ($content -notcontains "**/node_modules/") {
        Add-Content $gitignorePath "**/node_modules/"
        $updated = $true
    }
    if ($updated) {
        Write-Host ".gitignore에 node_modules 항목 추가 완료" -ForegroundColor Green
    } else {
        Write-Host ".gitignore는 이미 올바르게 구성되어 있음" -ForegroundColor Gray
    }
}

# 2. Git이 node_modules 추적 중인지 검사
$tracked = & $gitPath ls-files | Select-String "node_modules"
if ($tracked) {
    Write-Host "⚠️ Git이 node_modules를 추적 중입니다. 캐시에서 제거합니다..." -ForegroundColor Yellow
    & $gitPath rm -r --cached node_modules | Out-Null
    & $gitPath commit -m "chore: ignore node_modules directory" | Out-Null
    Write-Host "✅ 추적 제거 및 커밋 완료" -ForegroundColor Green
} else {
    Write-Host "✅ Git은 node_modules를 추적하지 않음" -ForegroundColor Green
}

# 3. Git 인덱스 업데이트 강제
& $gitPath update-index --really-refresh

# 4. 최종 상태 확인
Write-Host "`n📦 Git 상태 재확인 중..." -ForegroundColor Cyan
$status = & $gitPath status
Write-Host $status

Write-Host "`n🎉 모든 정리 완료. VSCode에서 경고가 계속 보이면 재시작 해보세요." -ForegroundColor Cyan
