$ErrorActionPreference = 'Stop'

$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$textExtensions = @('.css', '.htm', '.html', '.js', '.json', '.php', '.svg', '.xml')
$urlPattern = '(?i)https?:\\?/\\?/yameiracapital\.cc(?<path>(?:\\?/)?[^\s"''<>)]*)'
$changedFiles = 0
$changedLinks = 0
$restoredExternalHosts = 0

function Resolve-LocalTarget([string] $rawPath) {
    $decoded = $rawPath.Replace('\/', '/')
    $fragment = ''
    $query = ''
    $path = $decoded

    $hashAt = $path.IndexOf('#')
    if ($hashAt -ge 0) {
        $fragment = $path.Substring($hashAt)
        $path = $path.Substring(0, $hashAt)
    }
    $queryAt = $path.IndexOf('?')
    if ($queryAt -ge 0) {
        $query = $path.Substring($queryAt)
        $path = $path.Substring(0, $queryAt)
    }

    $relativeUrlPath = [Uri]::UnescapeDataString($path.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relativeUrlPath)) {
        return @{ File = (Join-Path $root 'index.html'); Suffix = $query + $fragment }
    }

    $candidates = [Collections.Generic.List[string]]::new()
    $candidates.Add((Join-Path $root $relativeUrlPath))
    $candidates.Add((Join-Path $root (Join-Path $relativeUrlPath 'index.html')))
    if ([IO.Path]::GetExtension($relativeUrlPath) -eq '') {
        $candidates.Add((Join-Path $root ($relativeUrlPath + '.html')))
    } elseif ([IO.Path]::GetExtension($relativeUrlPath) -ieq '.php') {
        $candidates.Add((Join-Path $root ([IO.Path]::ChangeExtension($relativeUrlPath, '.html'))))
    }

    foreach ($candidate in $candidates) {
        $full = [IO.Path]::GetFullPath($candidate)
        if ($full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and
            [IO.File]::Exists($full)) {
            return @{ File = $full; Suffix = $query + $fragment }
        }
    }
    return $null
}

Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $textExtensions -contains $_.Extension.ToLowerInvariant() -and
    $_.FullName -cne $PSCommandPath
} | ForEach-Object {
    $sourcePath = $_.FullName
    $content = [IO.File]::ReadAllText($sourcePath)
    $updated = [regex]::Replace($content, $urlPattern, {
        param($match)
        $target = Resolve-LocalTarget $match.Groups['path'].Value
        if ($null -eq $target) {
            $script:restoredExternalHosts++
            return $match.Value -replace '(?i)yameiracapital\.cc', 'interactivebrokers.com'
        }

        $sourceDirectoryUri = [Uri]::new((Split-Path -Parent $sourcePath) + [IO.Path]::DirectorySeparatorChar)
        $targetUri = [Uri]::new($target.File)
        $localUrl = $sourceDirectoryUri.MakeRelativeUri($targetUri).ToString() + $target.Suffix
        if ($match.Value.Contains('\/')) { $localUrl = $localUrl.Replace('/', '\/') }
        $script:changedLinks++
        return $localUrl
    })

    if ($updated -cne $content) {
        [IO.File]::WriteAllText($sourcePath, $updated, $utf8NoBom)
        $script:changedFiles++
    }
}

Write-Output "Restored $changedLinks Arclight URLs to local targets and $restoredExternalHosts unresolved URLs to their original host across $changedFiles files."
