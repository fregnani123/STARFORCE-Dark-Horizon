$filePath = "c:\Users\fabia\Desktop\STARFORCE-Dark-Horizon\script\gameLoop.js"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Replace the orphaned separator pattern
# Pattern: closing brace, blank line, orphaned separator, multiple blank lines, PLAYER & SPAWN
$content = $content -replace '(?m)^    \}$\s+// -+\s+\n\s+\n\s+\n\s+// PLAYER & SPAWN', "    `}`n`n    // PLAYER & SPAWN"

# Write back
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)

Write-Host "✓ File cleaned up"

# Verify
$lines = $content -split "`n"
Write-Host "Lines around 100-115:"
for ($i = 99; $i -lt 115 -and $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    Write-Host "$($lineNum.ToString().PadLeft(3)): $($lines[$i])"
}

# Check for wingman references
$wingmanCount = ($content | Select-String 'currentWingman|WINGMAN' -AllMatches).Matches.Count
if ($wingmanCount -eq 0) {
    Write-Host "`n✓ No currentWingman or WINGMAN references found"
} else {
    Write-Host "`n✗ Found $wingmanCount references to wingman"
}
