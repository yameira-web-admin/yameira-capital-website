param(
    [switch]$IncludeSvg,
    [switch]$RootOnly
)

$ErrorActionPreference = 'Stop'

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourceFiles = if ($RootOnly) {
    Get-ChildItem -LiteralPath $projectRoot -File |
        Where-Object { $_.Extension -in '.html', '.css' }
} else {
    Get-ChildItem $projectRoot -Recurse -File -Include *.html, *.css
}
$extensions = if ($IncludeSvg) { 'png|jpe?g|webp|gif|avif|svg' } else { 'png|jpe?g|webp|gif|avif' }
$attributePattern = '(?i)(?:src|srcset|poster|data-src|data-lazy-src)\s*=\s*["'']([^"'']+)["'']'
$cssUrlPattern = '(?i)url\(\s*["'']?([^\)"'']+)'
$missing = [Collections.Generic.Dictionary[string, object]]::new([StringComparer]::OrdinalIgnoreCase)

foreach ($sourceFile in $sourceFiles) {
    $body = [IO.File]::ReadAllText($sourceFile.FullName)
    $references = [Collections.Generic.List[string]]::new()

    foreach ($match in [regex]::Matches($body, $attributePattern)) {
        foreach ($candidate in $match.Groups[1].Value -split ',') {
            $references.Add(($candidate.Trim() -split '\s+')[0])
        }
    }

    foreach ($match in [regex]::Matches($body, $cssUrlPattern)) {
        $references.Add($match.Groups[1].Value.Trim())
    }

    foreach ($reference in $references) {
        $decoded = [Net.WebUtility]::HtmlDecode($reference)
        if ($decoded -match '^(?:data:|https?:|//|#|javascript:|about:|blob:)' -or
            $decoded -notmatch "(?i)\.($extensions)(?:[?#]|$)") {
            continue
        }

        $cleanReference = [Uri]::UnescapeDataString(($decoded -split '[?#]')[0])
        try {
            if ($cleanReference.StartsWith('/')) {
                $target = [IO.Path]::GetFullPath((Join-Path $projectRoot $cleanReference.TrimStart('/')))
            }
            else {
                $target = [IO.Path]::GetFullPath((Join-Path $sourceFile.DirectoryName $cleanReference))
            }
        }
        catch {
            continue
        }

        if ([IO.File]::Exists($target)) {
            continue
        }

        if (-not $missing.ContainsKey($target)) {
            $missing[$target] = [pscustomobject]@{
                Target = $target
                Reference = $cleanReference
                UsedBy = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
                Occurrences = 0
            }
        }

        $item = $missing[$target]
        $item.Occurrences++
        $null = $item.UsedBy.Add($sourceFile.FullName.Substring($projectRoot.Length + 1))
    }
}

$results = foreach ($item in $missing.Values) {
    [pscustomobject]@{
        Occurrences = $item.Occurrences
        Reference = $item.Reference
        UsedBy = ($item.UsedBy | Sort-Object) -join '; '
    }
}

$results = @($results | Sort-Object @{ Expression = 'Occurrences'; Descending = $true }, Reference)
Write-Host "Checked $($sourceFiles.Count) HTML/CSS files."
Write-Host "Missing local image targets: $($results.Count)"
$results | Format-Table -Wrap -AutoSize

if ($results.Count -gt 0) {
    exit 1
}
