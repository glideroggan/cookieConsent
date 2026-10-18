#Requires -Version 7
<#
.SYNOPSIS
    Regression suite for cookie-consent (the consent API), run against any base URL (production, or staging via the
    edge). Read-only.

.DESCRIPTION
    Checks /health (database reachable), /version, the public consent API (/consent and /api/consent: JSON with
    categories, open to any origin), that the admin API refuses a request without the key or with a wrong one, that
    unknown paths stay 404, and optionally the X-Slot header from the edge. Nothing is written and no admin key is
    sent or needed. One PASS/FAIL line per check; exit 1 on any failure.

.EXAMPLE
    ./tests/apps/cookie-consent.ps1 -BaseUrl https://nyviken.se/cookie-consent-api/ -ExpectSlot production
    ./tests/apps/cookie-consent.ps1 -BaseUrl http://127.0.0.1:5220/ -ExpectSlot none
    ./tests/apps/cookie-consent.ps1 -SwitchLink <signed link from GET /slots/cookie-consent/staging-link> -ExpectSlot staging
#>
param(
    [string]$BaseUrl = 'https://nyviken.se/cookie-consent-api/',
    [ValidateSet('production', 'staging', 'none', 'any')]
    [string]$ExpectSlot = 'any',
    # A signed "Open staging" link: the checks then run with the staging cookie (same URL, staging slot).
    [string]$SwitchLink,
    # The version /version must report (for example 1.0.3); without it any non-empty version passes.
    [string]$ExpectVersion
)

$ErrorActionPreference = 'Stop'
$failures = 0
function Check([string]$Name, [scriptblock]$Test) {
    try { $detail = & $Test; Write-Host "PASS $Name $detail" -ForegroundColor Green }
    catch { $script:failures++; Write-Host "FAIL $Name`: $($_.Exception.Message)" -ForegroundColor Red }
}
$session = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
if ($SwitchLink) {
    # The edge answers the link with 302 and a cookie; take the cookie without following the redirect.
    $handler = [System.Net.Http.HttpClientHandler]::new()
    $handler.AllowAutoRedirect = $false
    $handler.CookieContainer = $session.Cookies
    $switch = [System.Net.Http.HttpClient]::new($handler).GetAsync($SwitchLink).GetAwaiter().GetResult()
    if ([int]$switch.StatusCode -ne 302) { throw "switch link answered $([int]$switch.StatusCode), expected 302 (expired link?)" }
}
function Get([string]$Url, [hashtable]$Headers = @{}) {
    Invoke-WebRequest -Uri $Url -Headers $Headers -WebSession $session -SkipHttpErrorCheck -MaximumRedirection 0 -TimeoutSec 15
}

$base = $BaseUrl.TrimEnd('/') + '/'
$health = Get ($base + 'health')

Check 'health' {
    if ($health.StatusCode -ne 200) { throw "HTTP $($health.StatusCode)" }
    $body = $health.Content | ConvertFrom-Json
    if ($body.status -ne 'ok' -or $body.database -ne 'ok') { throw "status '$($body.status)', database '$($body.database)'" }
    "(version $($body.version), database ok)"
}

Check 'x-slot' {
    $slot = "$($health.Headers['X-Slot'])"
    switch ($ExpectSlot) {
        'none' { if ($slot) { throw "expected no X-Slot (direct route), got '$slot'" } }
        'any' { }
        default { if ($slot -ne $ExpectSlot) { throw "expected X-Slot '$ExpectSlot', got '$slot'" } }
    }
    "(X-Slot: $(if ($slot) { $slot } else { '<none>' }))"
}

Check 'version' {
    $r = Get ($base + 'version')
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    $version = "$(($r.Content | ConvertFrom-Json).version)"
    if (-not $version) { throw 'no version in the answer' }
    if ($ExpectVersion -and $version -ne $ExpectVersion.TrimStart('v')) { throw "version '$version', expected '$($ExpectVersion.TrimStart('v'))'" }
    "($version)"
}

foreach ($path in 'consent', 'api/consent') {
    Check "public $path" {
        $r = Get ($base + $path) @{ Origin = 'https://consent-suite.example.test' }
        if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
        if ("$($r.Headers['Content-Type'])" -notmatch 'application/json') { throw "content type $($r.Headers['Content-Type'])" }
        $body = $r.Content | ConvertFrom-Json
        if (-not $body.version) { throw 'no version in the consent answer' }
        if (@($body.categories).Count -eq 0) { throw 'no categories in the consent answer' }
        # Any website may read the consent config: the public policy allows every origin.
        if ("$($r.Headers['Access-Control-Allow-Origin'])" -ne '*') { throw "Access-Control-Allow-Origin '$($r.Headers['Access-Control-Allow-Origin'])', expected '*'" }
        "(HTTP 200, $(@($body.categories).Count) categories)"
    }
}

# The admin API is guarded by the key alone. Not routed at all (404) also keeps it shut; any 2xx/3xx is a failure.
foreach ($case in @(@{ Name = 'admin without key'; Headers = @{} }, @{ Name = 'admin with a wrong key'; Headers = @{ 'X-API-Key' = 'wrong-' + [guid]::NewGuid().ToString('N') } })) {
    Check $case.Name {
        $r = Get ($base + 'api/admin/global-config') $case.Headers
        if ($r.StatusCode -notin 401, 404) { throw "HTTP $($r.StatusCode), expected 401 (or 404 when admin is not routed)" }
        "(HTTP $($r.StatusCode))"
    }
}

Check 'unknown path stays 404' {
    $r = Get ($base + 'this-page-does-not-exist-' + [guid]::NewGuid().ToString('N').Substring(0, 6))
    if ($r.StatusCode -ne 404) { throw "HTTP $($r.StatusCode)" }
    '(HTTP 404)'
}

Write-Host ("SUMMARY cookie-consent: {0} failed" -f $failures)
exit $(if ($failures) { 1 } else { 0 })
