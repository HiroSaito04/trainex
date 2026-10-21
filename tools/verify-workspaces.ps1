# Read-only workspace and package.json preflight. Run from D:\trainex.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Write-Host "TRAINEX ROOT: $root"
$rootManifest = Join-Path $root 'package.json'
if (!(Test-Path $rootManifest)) {
    Write-Host 'MISSING root package.json' -ForegroundColor Red
    exit 1
}
$invalid = 0
$rootPkg = $null
Get-ChildItem $root -Recurse -File -Filter 'package.json' |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
    ForEach-Object {
        $file = $_.FullName
        try {
            $raw = Get-Content -LiteralPath $file -Raw
            if ([string]::IsNullOrWhiteSpace($raw)) { throw 'Empty package.json' }
            $pkg = $raw | ConvertFrom-Json -ErrorAction Stop
            if ($file -eq $rootManifest) { $rootPkg = $pkg }
            if ($pkg.name) { Write-Host "OK $file ($($pkg.name))" -ForegroundColor Green }
            else { Write-Host "WARN: Package without name: $file" -ForegroundColor Yellow }
        } catch {
            $invalid++
            Write-Host "INVALID $file" -ForegroundColor Red
            Write-Host $_.Exception.Message
        }
    }
if (-not $rootPkg.workspaces) {
    Write-Host "Missing 'workspaces' in root package.json" -ForegroundColor Red
    $invalid++
}
if ($invalid -gt 0) {
    Write-Host "$invalid issue(s) found. Fix before npm install." -ForegroundColor Red
    exit 1
}
Write-Host 'Manifests valid and root declares workspaces.' -ForegroundColor Green
