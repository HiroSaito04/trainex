# Optional only: final GLB is included already in the ZIP.
# Discover Blender without assuming the user installed a specific Blender version.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$script = Join-Path $root 'models\blender\scripts\export_exact_source.py'
$cmd = Get-Command blender.exe -ErrorAction SilentlyContinue
$exe = if ($cmd) { $cmd.Source } else { $null }
if (-not $exe) {
    $dirs = @('C:\Program Files\Blender Foundation', 'C:\Program Files (x86)\Blender Foundation')
    foreach ($dir in $dirs) {
        if (Test-Path $dir) {
            $found = Get-ChildItem $dir -Filter blender.exe -Recurse -File -ErrorAction SilentlyContinue |
                Sort-Object FullName -Descending | Select-Object -First 1
            if ($found) { $exe = $found.FullName; break }
        }
    }
}
if (-not $exe) {
    Write-Error 'Blender was not found. You can still run TRAINEX: the exact original GLB is included. For optional re-export, set the correct blender.exe path or install Blender.'
    exit 1
}
Write-Host "Using Blender: $exe"
& $exe -b --python "$script"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
