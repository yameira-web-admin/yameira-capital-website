$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$icon = Join-Path $root 'assets\icons\favicon (2).png'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$changed = 0

if (-not (Test-Path -LiteralPath $icon -PathType Leaf)) {
    throw "Favicon not found: $icon"
}

function Test-RemovedCta([string] $markup) {
    $text = [regex]::Replace($markup, '(?is)<[^>]+>', ' ')
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    $text = [regex]::Replace($text, '\s+', ' ').Trim()
    if ($text.Length -eq 0) {
        return $false
    }
    $withoutOpenAccount = [regex]::Replace($text, '(?i)Open Account', '').Trim()
    $withoutLogIn = [regex]::Replace($text, '(?i)Log In', '').Trim()
    return $withoutOpenAccount.Length -eq 0 -or $withoutLogIn.Length -eq 0
}

Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $_.Extension -in '.html', '.htm'
} | ForEach-Object {
    $path = $_.FullName
    $content = [System.IO.File]::ReadAllText($path)
    $updated = $content

    # Remove a complete list/paragraph wrapper when it only contains the CTA.
    $updated = [regex]::Replace(
        $updated,
        '(?is)<(?<wrapper>li|p)\b[^>]*>\s*(?<cta><(?<tag>a|button)\b[^>]*>.*?</\k<tag>>)\s*</\k<wrapper>>',
        { param($match) if (Test-RemovedCta $match.Groups['cta'].Value) { '' } else { $match.Value } }
    )
    $updated = [regex]::Replace(
        $updated,
        '(?is)<(?<tag>a|button)\b[^>]*>.*?</\k<tag>>',
        { param($match) if (Test-RemovedCta $match.Value) { '' } else { $match.Value } }
    )

    # Every page gets one favicon link with a path relative to that page.
    $updated = [regex]::Replace(
        $updated,
        '(?is)<link\b[^>]*\brel\s*=\s*(["''])[^"'']*(?:icon|apple-touch-icon)[^"'']*\1[^>]*>\s*',
        ''
    )
    $relativeIcon = [System.Uri]::UnescapeDataString(
        ([System.Uri]::new((Split-Path -Parent $path) + [IO.Path]::DirectorySeparatorChar)).MakeRelativeUri(
            [System.Uri]::new($icon)
        ).ToString()
    ).Replace(' ', '%20')
    $faviconTag = "<link rel=`"icon`" type=`"image/png`" href=`"$relativeIcon`">"
    $updated = [regex]::Replace(
        $updated,
        '(?is)<head\b[^>]*>',
        { param($match) $match.Value + "`r`n" + $faviconTag },
        1
    )

    if ($updated -cne $content) {
        [System.IO.File]::WriteAllText($path, $updated, $utf8NoBom)
        $script:changed++
    }
}

Write-Output "Updated $changed HTML files."
