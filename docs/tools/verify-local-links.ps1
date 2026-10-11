$ErrorActionPreference = 'Stop'

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$indexPath = Join-Path $projectRoot 'index.html'
$html = [IO.File]::ReadAllText($indexPath)
$pattern = '<a\b[^>]*href=["'']([^"''#?]+\.html)(?:[?#][^"'']*)?["'']'
$targets = [regex]::Matches($html, $pattern, 'IgnoreCase') |
    ForEach-Object { $_.Groups[1].Value } |
    Where-Object { $_ -notmatch '^(?:https?:|//)' } |
    Sort-Object -Unique

$missing = @($targets | Where-Object {
    -not [IO.File]::Exists([IO.Path]::GetFullPath((Join-Path $projectRoot $_)))
})

Write-Host "Checked $($targets.Count) local HTML targets from index.html."
if ($missing.Count -gt 0) {
    Write-Error ("Missing {0} target(s):`n{1}" -f $missing.Count, ($missing -join "`n"))
    exit 1
}

Write-Host 'All local HTML targets exist.'
