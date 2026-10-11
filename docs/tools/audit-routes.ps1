param(
  [int]$Top = 40
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$files = Get-ChildItem -LiteralPath $root -Recurse -File -Filter '*.html'
$missingNavigation = @{}
$missingResources = @{}
$attributePattern = '(?is)(src|href|data-src|data-lazy-src|poster)\s*=\s*["'']([^"'']+)["'']'

foreach ($file in $files) {
  $html = [IO.File]::ReadAllText($file.FullName)
  foreach ($match in [regex]::Matches($html, $attributePattern)) {
    $attribute = $match.Groups[1].Value.ToLowerInvariant()
    $reference = [Net.WebUtility]::HtmlDecode($match.Groups[2].Value).Trim()
    if (-not $reference -or $reference -match '^(?:https?:|//|data:|javascript:|mailto:|tel:|about:|blob:|#)') { continue }

    $clean = ($reference -split '[?#]')[0]
    if (-not $clean) { continue }

    try {
      if ($clean.StartsWith('/')) {
        $target = [IO.Path]::GetFullPath((Join-Path $root $clean.TrimStart('/')))
        $route = $clean
      } else {
        $target = [IO.Path]::GetFullPath((Join-Path $file.DirectoryName $clean))
        $route = '/' + ([IO.Path]::GetRelativePath($root, $target) -replace '\\', '/')
      }
    } catch { continue }

    if ([IO.File]::Exists($target) -or
        ([IO.Directory]::Exists($target) -and [IO.File]::Exists((Join-Path $target 'index.html'))) -or
        ($route -eq '/' -and [IO.File]::Exists((Join-Path $root 'index.html')))) { continue }

    $key = "$route|$($file.FullName)"
    if ($attribute -eq 'href' -and $clean -match '(?i)(?:\.html?$|/$|^[^./]+$)') {
      $missingNavigation[$key] = $route
    } else {
      $missingResources[$key] = $route
    }
  }
}

Write-Output "HTML files scanned: $($files.Count)"
Write-Output "Missing navigation references: $($missingNavigation.Count)"
$missingNavigation.Values |
  Group-Object |
  Sort-Object Count -Descending |
  Select-Object -First $Top |
  ForEach-Object { Write-Output ("NAV {0}x {1}" -f $_.Count, $_.Name) }
Write-Output "Missing resource references: $($missingResources.Count)"
$missingResources.Values |
  Group-Object |
  Sort-Object Count -Descending |
  Select-Object -First $Top |
  ForEach-Object { Write-Output ("RES {0}x {1}" -f $_.Count, $_.Name) }
