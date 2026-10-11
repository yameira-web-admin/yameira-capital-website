$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$changedFiles = 0
$platformSections = 0
$educationSections = 0
$languageSections = 0
$campusLanguageSections = 0

Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $_.Extension -in '.html', '.htm'
} | ForEach-Object {
    $path = $_.FullName
    $content = [System.IO.File]::ReadAllText($path)
    $updated = $content

    $updated = [regex]::Replace(
        $updated,
        '(?is)\s*<!--\s*PLATFORMS\s*-->.*?(?=<!--\s*(?:ACCOUNTS|ACCOUNT TYPES)\s*-->)',
        { param($match) $script:platformSections++; "`r`n    " }
    )
    $updated = [regex]::Replace(
        $updated,
        '(?is)\s*<!--\s*EDUCATION\s*-->.*?(?=<!--\s*SUPPORT\s*-->)',
        { param($match) $script:educationSections++; "`r`n    " }
    )
    # Main-site desktop language selector. The marker immediately precedes the
    # self-contained list item; matching that item avoids depending on the
    # surrounding navbar's varying container depth.
    $updated = [regex]::Replace(
        $updated,
        '(?is)\s*<!--\s*LANGUAGE(?:\s+SELECTOR)?\s*-->\s*<li\b(?=[^>]*\bid=["'']language-expand["''])[^>]*>.*?</li>',
        { param($match) $script:languageSections++; '' }
    )
    $updated = [regex]::Replace(
        $updated,
        '(?is)\s*<!--\s*LANGUAGE\s+SELECTOR\s*-->\s*<li\b[^>]*>\s*<a\b(?=[^>]*\bid=["'']nav-language["''])[^>]*>.*?</li>',
        { param($match) $script:languageSections++; '' }
    )

    # Campus has separate desktop mega-menu and mobile accordion entries.
    $updated = [regex]::Replace(
        $updated,
        '(?is)<li\b[^>]*\bdata-megamenu=["'']megamenu-language["''][^>]*>.*?</li>',
        { param($match) $script:campusLanguageSections++; '' }
    )
    $updated = [regex]::Replace(
        $updated,
        '(?is)<div\b[^>]*class=["''][^"'']*\bmegamenu\s+megamenu-language\b[^"'']*["''][^>]*>.*?(?=<div\b[^>]*class=["''][^"'']*\bmobile-nav\b)',
        { param($match) $script:campusLanguageSections++; '' }
    )
    $updated = [regex]::Replace(
        $updated,
        '(?is)<div\b[^>]*class=["''][^"'']*\bnav-header\b[^"'']*["''][^>]*data-bs-target=["'']#accordion-language["''][^>]*>.*?(?=<div\b[^>]*class=["''][^"'']*\bmobile-nav-cta\b)',
        { param($match) $script:campusLanguageSections++; '' }
    )

    if ($updated -cne $content) {
        [System.IO.File]::WriteAllText($path, $updated, $utf8NoBom)
        $script:changedFiles++
    }
}

Write-Output "Updated $changedFiles files; removed $platformSections platform, $educationSections education, $languageSections main-site language, and $campusLanguageSections Campus language navigation sections."
