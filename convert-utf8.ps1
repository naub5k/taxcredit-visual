$files = Get-ChildItem -Recurse -Include *.js,*.jsx,*.css -Path ".\src"
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Converted $($file.FullName) to UTF-8 without BOM"
    }
} 