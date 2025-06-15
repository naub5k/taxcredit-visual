# Azure Function 배포 스크립트
Write-Host "🚀 Azure Function taxcredit-ai-func-v2 배포 시작" -ForegroundColor Green

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "📁 현재 디렉토리: $currentDir" -ForegroundColor Yellow

# Git 상태 확인
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "📝 변경된 파일들:" -ForegroundColor Yellow
        git status --short
        
        # Git add
        Write-Host "➕ 변경사항 추가 중..." -ForegroundColor Blue
        git add .
        
        # Git commit
        $commitMessage = "Azure Function 오류 처리 개선 및 안정성 강화 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "💾 커밋 중: $commitMessage" -ForegroundColor Blue
        git commit -m "$commitMessage"
        
        # Git push
        Write-Host "🌐 GitHub에 푸시 중..." -ForegroundColor Blue
        git push
        
        Write-Host "✅ GitHub Actions를 통한 자동 배포가 시작됩니다!" -ForegroundColor Green
        Write-Host "🔗 배포 상태 확인: https://github.com/naub5k/taxcredit-mobileapp/actions" -ForegroundColor Cyan
        
    } else {
        Write-Host "ℹ️ 변경사항이 없습니다." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Git 오류: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 수동 배포가 필요합니다." -ForegroundColor Yellow
}

Write-Host "🏁 배포 스크립트 완료" -ForegroundColor Green 