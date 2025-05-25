# Azure Function Local Test Script
Write-Host "=== Azure Function Local Test Start ===" -ForegroundColor Green

# Check current location
$currentPath = Get-Location
Write-Host "Current Path: $currentPath" -ForegroundColor Yellow

# Check host.json file
if (Test-Path "host.json") {
    Write-Host "OK host.json file found - Azure Function can run" -ForegroundColor Green
} else {
    Write-Host "ERROR host.json file not found. Not a valid Azure Function directory." -ForegroundColor Red
    Write-Host "Correct path: taxcredit_mobileapp/api-func" -ForegroundColor Yellow
    exit 1
}

# Test URL definition with manual URL encoding
$baseUrl = "http://localhost:7071/api/getSampleList"

# Manual URL encoding for Korean characters
$sidoParam = "%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C"  # Seoul
$gugunParam = "%EA%B0%95%EB%82%A8%EA%B5%AC"  # Gangnam-gu

$testCases = @(
    @{
        name = "Basic Test (No Pagination)"
        url = "$baseUrl" + "?sido=$sidoParam" + "&gugun=$gugunParam"
        description = "Compatibility check with existing method"
    },
    @{
        name = "Default Page Size Test (20 items)"
        url = "$baseUrl" + "?sido=$sidoParam" + "&gugun=$gugunParam" + "&page=1"
        expectedDataCount = 20
        description = "Default page size should be 20 items"
    },
    @{
        name = "Page 1 Test (20 items)"
        url = "$baseUrl" + "?sido=$sidoParam" + "&gugun=$gugunParam" + "&page=1&pageSize=20"
        expectedDataCount = 20
        description = "First page 20 items query"
    },
    @{
        name = "Page 2 Test (20 items)"
        url = "$baseUrl" + "?sido=$sidoParam" + "&gugun=$gugunParam" + "&page=2&pageSize=20"
        expectedDataCount = 20
        description = "Second page 20 items query (should be different data)"
    },
    @{
        name = "Small Page Size Test (10 items)"
        url = "$baseUrl" + "?sido=$sidoParam" + "&gugun=$gugunParam" + "&page=1&pageSize=10"
        expectedDataCount = 10
        description = "Custom page size 10 items"
    }
)

Write-Host ""
Write-Host "Azure Functions Core Tools Execution Check" -ForegroundColor Cyan
Write-Host "Please run Azure Function first with this command:" -ForegroundColor Yellow
Write-Host "func start" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to start testing after Function is running..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "=== Test Start ===" -ForegroundColor Green

# Execute each test case
foreach ($test in $testCases) {
    Write-Host ""
    Write-Host "=== $($test.name) ===" -ForegroundColor Blue
    Write-Host "Description: $($test.description)" -ForegroundColor Gray
    Write-Host "URL: $($test.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $test.url -Method GET -ContentType "application/json"
        
        # Response structure validation
        Write-Host "OK Response received successfully" -ForegroundColor Green
        
        # Check new response structure
        if ($response.data) {
            Write-Host "OK data field exists: $($response.data.Count) items" -ForegroundColor Green
            
            # Display first data sample
            if ($response.data.Count -gt 0) {
                $firstItem = $response.data[0]
                Write-Host "   First data: [Company data found]" -ForegroundColor Gray
            }
        } else {
            Write-Host "ERROR data field missing" -ForegroundColor Red
        }
        
        if ($response.pagination) {
            Write-Host "OK pagination field exists" -ForegroundColor Green
            Write-Host "   - page: $($response.pagination.page)" -ForegroundColor Gray
            Write-Host "   - pageSize: $($response.pagination.pageSize)" -ForegroundColor Gray
            Write-Host "   - totalCount: $($response.pagination.totalCount)" -ForegroundColor Gray
            Write-Host "   - totalPages: $($response.pagination.totalPages)" -ForegroundColor Gray
            Write-Host "   - hasNext: $($response.pagination.hasNext)" -ForegroundColor Gray
            Write-Host "   - hasPrev: $($response.pagination.hasPrev)" -ForegroundColor Gray
        } else {
            Write-Host "ERROR pagination field missing" -ForegroundColor Red
        }
        
        if ($response.aggregates) {
            Write-Host "OK aggregates field exists" -ForegroundColor Green
            Write-Host "   - maxEmployeeCount: $($response.aggregates.maxEmployeeCount)" -ForegroundColor Gray
            Write-Host "   - totalCount: $($response.aggregates.totalCount)" -ForegroundColor Gray
        } else {
            Write-Host "ERROR aggregates field missing" -ForegroundColor Red
        }
        
        if ($response.meta) {
            Write-Host "OK meta field exists" -ForegroundColor Green
            if ($response.meta.performance) {
                Write-Host "   - duration: $($response.meta.performance.duration)ms" -ForegroundColor Gray
                Write-Host "   - serverCalculated: $($response.meta.performance.serverCalculated)" -ForegroundColor Gray
            }
        } else {
            Write-Host "ERROR meta field missing" -ForegroundColor Red
        }
        
        # Data count validation (if expected value exists)
        if ($test.expectedDataCount) {
            if ($response.data.Count -eq $test.expectedDataCount) {
                Write-Host "OK Data count matches: $($response.data.Count) items" -ForegroundColor Green
            } else {
                Write-Host "WARNING Data count mismatch: Expected $($test.expectedDataCount), Actual $($response.data.Count)" -ForegroundColor Yellow
            }
        }
        
        # Error response check
        if ($response.error) {
            Write-Host "ERROR Error response: $($response.error.message)" -ForegroundColor Red
            Write-Host "   Details: $($response.error.details)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "ERROR Request failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Connection error guidance
        if ($_.Exception.Message -like "*connection*" -or $_.Exception.Message -like "*connect*") {
            Write-Host "INFO Azure Function may not be running." -ForegroundColor Yellow
            Write-Host "   Run with this command: func start" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Result Summary:" -ForegroundColor Cyan
Write-Host "- All fields (data, pagination, aggregates, meta) should exist" -ForegroundColor White
Write-Host "- Different data should be returned for each page" -ForegroundColor White
Write-Host "- Performance information (duration) should be included" -ForegroundColor White
Write-Host ""
Write-Host "If successful, ready to deploy to Azure!" -ForegroundColor Green 