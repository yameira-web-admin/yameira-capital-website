param(
  [switch]$IncludeNested
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$verifyArgs = @('-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'verify-site.ps1'))
if ($IncludeNested) { $verifyArgs += '-IncludeNested' }

& powershell @verifyArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify-local-links.ps1')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify-local-images.ps1') -RootOnly
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output "Pre-deploy checks passed for $root"
