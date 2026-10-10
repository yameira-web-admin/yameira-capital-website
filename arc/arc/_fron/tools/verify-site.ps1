param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [switch]$IncludeNested
)

$ErrorActionPreference = 'Stop'
$files = if ($IncludeNested) {
  Get-ChildItem -LiteralPath $Root -Recurse -File -Filter '*.html'
} else {
  Get-ChildItem -LiteralPath $Root -File -Filter '*.html'
}

$missing = New-Object System.Collections.Generic.List[string]
$legacy = New-Object System.Collections.Generic.List[string]
$malformed = New-Object System.Collections.Generic.List[string]
$referencePattern = '(?i)(?:src|href)\s*=\s*["'']([^"''#?]+)'

foreach ($file in $files) {
  $html = [IO.File]::ReadAllText($file.FullName)
  $scriptOpen = ([regex]::Matches($html, '<script\b')).Count
  $scriptClose = ([regex]::Matches($html, '</script>')).Count
  if ($scriptOpen -ne $scriptClose -or $html.Contains('`r`n')) {
    $malformed.Add("$($file.FullName): script tags or generated line endings are malformed")
  }
  if ($html -match '/scripts/common/js/lib\.js|/scripts/common/js/forge\.all\.min\.js') {
    $legacy.Add("$($file.FullName): obsolete dynamic dependency")
  }
  foreach ($match in [regex]::Matches($html, $referencePattern)) {
    $ref = $match.Groups[1].Value
    if ($ref -match '^(?:https?:|//|data:|mailto:|javascript:|tel:|about:)') { continue }
    # Navigation targets may intentionally point to the restored mirror or a
    # future route. The gate checks executable and visual resources only.
    if ($ref -notmatch '(?i)^(?:/)?(?:css|scripts|fonts|assets|images|search|data)/' -and
        $ref -notmatch '(?i)\.(?:css|js|mjs|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|json|pdf)$') { continue }
    $ref = [Uri]::UnescapeDataString($ref)
    $relative = $ref.TrimStart('/') -replace '/', '\'
    $target = if ($ref.StartsWith('/')) {
      Join-Path $Root $relative
    } else {
      Join-Path $file.DirectoryName $relative
    }
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
      $missing.Add("$($file.FullName) -> $ref")
    }
  }
}

Write-Output "Checked $($files.Count) HTML files under $Root"
if ($legacy.Count -gt 0) {
  Write-Error ("Obsolete dependencies found:`n" + ($legacy -join "`n"))
}
if ($missing.Count -gt 0) {
  Write-Error ("Missing local resources:`n" + (($missing | Select-Object -First 100) -join "`n"))
}
if ($malformed.Count -gt 0) {
  Write-Error ("Malformed HTML script blocks:`n" + (($malformed | Select-Object -First 100) -join "`n"))
}
Write-Output 'Static site verification passed.'
