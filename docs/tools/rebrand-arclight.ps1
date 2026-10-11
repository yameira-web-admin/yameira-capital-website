$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$textExtensions = @(
    '.css', '.htm', '.html', '.js', '.json', '.md', '.php', '.ps1',
    '.readme', '.svg', '.txt', '.xml'
)
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$changed = 0

Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $textExtensions -contains $_.Extension.ToLowerInvariant() -and
    $_.FullName -cne $PSCommandPath
} | ForEach-Object {
    $path = $_.FullName
    $content = [System.IO.File]::ReadAllText($path)
    $updated = $content

    # Replace display branding while preserving lowercase internal selectors and paths.
    $updated = $updated.Replace('INTERACTIVE BROKERS', 'YAMEIRA CAPITAL')
    $updated = $updated.Replace('Interactive Brokers', 'Yameira Capital')
    $updated = $updated.Replace('interactive brokers', 'yameira capital')
    $updated = [regex]::Replace($updated, '\bIBKR\b', 'YMC')
    $updated = [regex]::Replace($updated, '\bIbkr\b', 'Ymc')
    $updated = [regex]::Replace(
        $updated,
        '\bARC (?:LLC|India|Canada|Ireland|Japan|Singapore|Australia|Securities(?: Services)? LLC)\b',
        'Yameira Capital'
    )
    $updated = [regex]::Replace(
        $updated,
        '\bYameira Capital (?:LLC|Canada Inc\.|Ireland Limited|Australia Pty\. Ltd\.|Hong Kong Limited|India Pvt\. Ltd\.|Securities Japan Inc\.|Singapore Pte\. Ltd\.)\b',
        'Yameira Capital'
    )

    # Use the supplied Arclight artwork anywhere a page still requests an old logo.
    if ($path.EndsWith('.html', [System.StringComparison]::OrdinalIgnoreCase) -or
        $path.EndsWith('.htm', [System.StringComparison]::OrdinalIgnoreCase) -or
        $path.EndsWith('.css', [System.StringComparison]::OrdinalIgnoreCase) -or
        $path.EndsWith('.js', [System.StringComparison]::OrdinalIgnoreCase)) {
        $updated = [regex]::Replace(
            $updated,
            '(?i)(?:\.\./)*(?:images/common/logos/ibkr|assets/images)/(?:interactive-brokers[^"''\)\s]*|ibkr-(?:black|white|inverse)|ibkr)\.svg',
            '/assets/images/arc1.png'
        )
    }

    if ($updated -cne $content) {
        [System.IO.File]::WriteAllText($path, $updated, $utf8NoBom)
        $script:changed++
    }
}

Write-Output "Rebranded $changed text files."
