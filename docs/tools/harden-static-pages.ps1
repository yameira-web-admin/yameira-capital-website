param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$guard = @'
<style id="ymc-first-paint-guard">
  html.site-loading body { visibility: hidden; }
</style>
<script>
  (function () {
    var root = document.documentElement;
    root.classList.add('site-loading');
    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      root.classList.remove('site-loading');
    }
    document.addEventListener('DOMContentLoaded', function () {
      window.requestAnimationFrame(reveal);
    }, { once: true });
    window.setTimeout(reveal, 1800);
  }());
</script>
'@

$utf8 = New-Object System.Text.UTF8Encoding($false)
Get-ChildItem -LiteralPath $Root -File -Filter '*.html' | ForEach-Object {
  $path = $_.FullName
  $text = [IO.File]::ReadAllText($path)

  $text = $text.Replace("@import url('css/bootstrap-5.2.2/bootstrap.min.css') layer(bootstrap);", '')
  $text = $text.Replace('createScriptElement({ source : "/scripts/common/js/bootstrap-5.2.2/bootstrap.bundle.min.js", loadfunction: bsLoaded  });', '<script type="text/javascript" src="scripts/common/js/bootstrap-5.2.2/bootstrap.bundle.min.js"></script>')
  if ($text -notmatch 'css/bootstrap-5\.2\.2/bootstrap\.min\.css') {
    $text = $text.Replace('<!-- STYLES HEAD -->', '<!-- STYLES HEAD -->' + "`r`n" + '<link rel="stylesheet" type="text/css" media="all" href="css/bootstrap-5.2.2/bootstrap.min.css">')
  }
  if ($text.Contains('css/local-home.css') -and -not $text.Contains('ymc-first-paint-guard')) {
    $pattern = '(<link[^>]+css/local-home\.css[^>]*>)'
    $text = [regex]::Replace($text, $pattern, '$1' + "`r`n" + $guard)
  }

  $text = [regex]::Replace($text, '(?m)^\s*createScriptElement\(\{ source\s*:\s*["'']/scripts/common/js/lib\.js[^;]+;\s*\r?\n', '')
  $text = [regex]::Replace($text, '(?m)^\s*createScriptElement\(\{ source\s*:\s*["'']/?scripts/common/js/forge\.all\.min\.js[^;]+;\s*\r?\n', '')
  $text = $text.Replace('setTimeout(checkCookies(), 100)', 'setTimeout(checkCookies, 100)')
  $text = $text.Replace('setTimeout(addCookies(), 100)', 'setTimeout(addCookies, 100)')
  $text = $text.Replace('window.onload = function (){ checkWebCookie();}', "window.addEventListener('load', checkWebCookie, { once: true });")
  # Keep the static Bootstrap tag outside the inline Cookie helper script.
  # Older mirrored pages have no closing tag between these blocks.
  $text = [regex]::Replace(
    $text,
    '(setTimeout\(addCookies, 100\);\s*\}\s*)<script type="text/javascript" src="scripts/common/js/bootstrap-5\.2\.2/bootstrap\.bundle\.min\.js"></script>\s*(function bsrcFingerprintHandler\(\))',
    '$1</script>`r`n<script type="text/javascript" src="scripts/common/js/bootstrap-5.2.2/bootstrap.bundle.min.js"></script>`r`n<script>`r`n$2',
    [Text.RegularExpressions.RegexOptions]::Singleline
  )
  # The mirror's GTM and Akamai snippets point at non-JS HTML fallbacks and
  # create parse errors during a cold load. The static site has no telemetry.
  $text = [regex]::Replace($text, '<script(?:(?!</script>).)*GTM-NK9NSD(?:(?!</script>).)*</script>', '', [Text.RegularExpressions.RegexOptions]::Singleline)
  $text = [regex]::Replace($text, '<script(?:(?!</script>).)*BOOMR_API_key(?:(?!</script>).)*</script>', '', [Text.RegularExpressions.RegexOptions]::Singleline)
  $text = [regex]::Replace($text, 'function bsLoaded\(\).*?(?=function loadFps)', "function bsLoaded() {`r`n  // Optional upstream effects are not part of the local static bundle.`r`n}`r`n", [Text.RegularExpressions.RegexOptions]::Singleline)
  $text = [regex]::Replace($text, 'function loadFps\(\).*?(?=function uiLoaded)', "function loadFps() {`r`n  // Analytics and fingerprinting are disabled for this static site.`r`n}`r`n", [Text.RegularExpressions.RegexOptions]::Singleline)
  $text = [regex]::Replace($text, 'function uiLoaded\(\).*?(?=function storeCookie)', "function uiLoaded() {`r`n}`r`n", [Text.RegularExpressions.RegexOptions]::Singleline)
  $text = [regex]::Replace($text, '// SET HEIGHT OF HERO IMAGE FOR RESIZE WITH BANNER.*?(?=var login = document\.querySelector)', "// The mirrored homepage carousel is not part of the local static shell.`r`n", [Text.RegularExpressions.RegexOptions]::Singleline)
  if ($text -notmatch 'if \(!panel \|\| !toggleBtn\)') {
    $text = [regex]::Replace($text, '(const toggleBtn = document\.getElementById\(''toggleBtn''\);)', '$1' + "`r`n  if (!panel || !toggleBtn) return;", [Text.RegularExpressions.RegexOptions]::Singleline)
  }
  $loginReplacement = "[login, portal].filter(Boolean).forEach(function (element) {`r`n  element.addEventListener(`"click`", function() { setCookie(`"IB_LGN`", `"T`", 365); });`r`n});"
  $text = [regex]::Replace($text, 'login\.addEventListener\("click", function\(\) \{ setCookie\("IB_LGN", "T", 365\); \}\);\s*\r?\nportal\.addEventListener\("click", function\(\) \{ setCookie\("IB_LGN", "T", 365\); \}\);', $loginReplacement)
  $text = $text.Replace('`r`n', [Environment]::NewLine)
  $text = $text.Replace('\r\n', "`r`n")

  [IO.File]::WriteAllText($path, $text, $utf8)
}
