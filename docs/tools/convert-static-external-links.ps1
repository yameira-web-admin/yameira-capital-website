$ErrorActionPreference = 'Stop'

$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$externalAnchorPattern = '(?is)<a\b(?=[^>]*\bhref\s*=\s*["''](?:https?:)?//)[^>]*>.*?</a\s*>'
$openingAnchorPattern = '(?is)^<a\b(?<attributes>[^>]*)>'
$changedFiles = 0
$convertedLinks = 0

Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $_.Extension -in '.html', '.htm'
} | ForEach-Object {
    $path = $_.FullName
    $content = [IO.File]::ReadAllText($path)
    if ($content -notmatch '(?i)</head\s*>|<body\b') {
        return
    }

    $updated = [regex]::Replace($content, $externalAnchorPattern, {
        param($anchorMatch)

        $converted = [regex]::Replace($anchorMatch.Value, $openingAnchorPattern, {
            param($openingMatch)
            $attributes = $openingMatch.Groups['attributes'].Value
            $attributes = [regex]::Replace($attributes, '\s+href\s*=\s*(?:"[^"]*"|''[^'']*'')', '', 'IgnoreCase')
            $attributes = [regex]::Replace($attributes, '\s+(?:target|rel|onclick)\s*=\s*(?:"[^"]*"|''[^'']*'')', '', 'IgnoreCase')
            return '<span' + $attributes + ' data-external-link-disabled>'
        }, 1)
        $converted = [regex]::Replace($converted, '(?is)</a\s*>$', '</span>', 1)
        $script:convertedLinks++
        return $converted
    })

    if ($updated -cne $content) {
        [IO.File]::WriteAllText($path, $updated, $utf8NoBom)
        $script:changedFiles++
    }
}

Write-Output "Converted $convertedLinks external anchors to text across $changedFiles static pages."
