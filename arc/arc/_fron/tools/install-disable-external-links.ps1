$ErrorActionPreference = 'Stop'

$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$marker = 'data-static-external-links-disabled'
$assets = @'
    <link rel="stylesheet" href="/css/disable-external-links.css" data-static-external-links-disabled>
    <script src="/scripts/disable-external-links.js" defer data-static-external-links-disabled></script>
'@
$installedBlockPattern = '(?m)^\s*<link rel="stylesheet" href="/css/disable-external-links\.css" data-static-external-links-disabled>\r?\n\s*<script src="/scripts/disable-external-links\.js" defer data-static-external-links-disabled></script>\r?\n?'
$changedFiles = 0
$cleanedNonDocuments = 0

Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $_.Extension -in '.html', '.htm'
} | ForEach-Object {
    $path = $_.FullName
    $content = [IO.File]::ReadAllText($path)

    # Some mirrored API responses use an .html suffix but contain JSON or text.
    # They are not browser documents and must remain byte-valid response bodies.
    if ($content -notmatch '(?i)</head\s*>' -and $content -notmatch '(?i)<body\b') {
        if ($content.Contains($marker)) {
            $updated = [regex]::Replace($content, $installedBlockPattern, '', 1)
            [IO.File]::WriteAllText($path, $updated, $utf8NoBom)
            $script:cleanedNonDocuments++
        }
        return
    }

    if ($content.Contains($marker)) {
        return
    }

    if ($content -match '(?i)</head\s*>') {
        $updated = [regex]::Replace($content, '(?i)</head\s*>', "$assets`r`n</head>", 1)
    } elseif ($content -match '(?i)<body\b') {
        $updated = [regex]::Replace($content, '(?i)<body\b', "$assets`r`n<body", 1)
    }

    [IO.File]::WriteAllText($path, $updated, $utf8NoBom)
    $script:changedFiles++
}

Write-Output "Installed external-link controls in $changedFiles static pages; cleaned $cleanedNonDocuments non-document responses."
