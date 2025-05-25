# 로컬 Azure Function 테스트 스크립트
Write-Host "=== 로컬 Azure Function 테스트 시작 ===" -ForegroundColor Green

# 테스트 URL 정의
$baseUrl = "http://localhost:7071/api/getSampleList"
$testCases = @(
    @{
        name = "페이지 1 테스트"
        url = "$baseUrl?sido=서울특별시&gugun=강남구&page=1&pageSize=10"
        expectedDataCount = 10
    },
    @{
        name = "페이지 2 테스트"
        url = "$baseUrl?sido=서울특별시&gugun=강남구&page=2&pageSize=10"
        expectedDataCount = 10
    },
    @{
        name = "페이지 3 테스트"
        url = "$baseUrl?sido=서울특별시&gugun=강남구&page=3&pageSize=10"
        expectedDataCount = 10
    },
    @{
        name = "큰 페이지 크기 테스트"
        url = "$baseUrl?sido=서울특별시&gugun=강남구&page=1&pageSize=50"
        expectedDataCount = 50
    }
)

Write-Host "Azure Functions Core Tools가 실행 중인지 확인하세요." -ForegroundColor Yellow
Write-Host "실행 명령: func start" -ForegroundColor Cyan
Write-Host ""

# 각 테스트 케이스 실행
foreach ($test in $testCases) {
    Write-Host "=== $($test.name) ===" -ForegroundColor Blue
    Write-Host "URL: $($test.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $test.url -Method GET -ContentType "application/json"
        
        # 응답 구조 검증
        Write-Host "✅ 응답 수신 성공" -ForegroundColor Green
        
        if ($response.data) {
            Write-Host "✅ data 필드 존재: $($response.data.Count)건" -ForegroundColor Green
        } else {
            Write-Host "❌ data 필드 누락" -ForegroundColor Red
        }
        
        if ($response.pagination) {
            Write-Host "✅ pagination 필드 존재" -ForegroundColor Green
            Write-Host "   - page: $($response.pagination.page)" -ForegroundColor Gray
            Write-Host "   - totalCount: $($response.pagination.totalCount)" -ForegroundColor Gray
            Write-Host "   - totalPages: $($response.pagination.totalPages)" -ForegroundColor Gray
        } else {
            Write-Host "❌ pagination 필드 누락" -ForegroundColor Red
        }
        
        if ($response.aggregates) {
            Write-Host "✅ aggregates 필드 존재" -ForegroundColor Green
            Write-Host "   - maxEmployeeCount: $($response.aggregates.maxEmployeeCount)" -ForegroundColor Gray
            Write-Host "   - totalCount: $($response.aggregates.totalCount)" -ForegroundColor Gray
        } else {
            Write-Host "❌ aggregates 필드 누락" -ForegroundColor Red
        }
        
        if ($response.meta) {
            Write-Host "✅ meta 필드 존재" -ForegroundColor Green
            if ($response.meta.performance) {
                Write-Host "   - duration: $($response.meta.performance.duration)ms" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ meta 필드 누락" -ForegroundColor Red
        }
        
        # 데이터 개수 검증
        if ($response.data.Count -eq $test.expectedDataCount) {
            Write-Host "✅ 데이터 개수 일치: $($response.data.Count)건" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 데이터 개수 불일치: 기대 $($test.expectedDataCount)건, 실제 $($response.data.Count)건" -ForegroundColor Yellow
        }
        
        # 오류 응답 확인
        if ($response.error) {
            Write-Host "❌ 오류 응답: $($response.error.message)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ 요청 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== 테스트 완료 ===" -ForegroundColor Green
Write-Host "모든 테스트가 성공하면 Azure에 배포할 준비가 완료된 것입니다." -ForegroundColor Yellow 