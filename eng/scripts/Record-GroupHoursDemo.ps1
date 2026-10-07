param(
    [string]$SourceRoot = (Resolve-Path "$PSScriptRoot/../..").Path,
    [int]$Port = 5268,
    [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot/../..").Path
$source = (Resolve-Path $SourceRoot).Path
$runId = [Guid]::NewGuid().ToString('N')
$run = Join-Path $repo "artifacts/demo-runs/$runId"
$database = "QbcDemo_$runId"
$publish = Join-Path $source 'artifacts/demo-publish'
New-Item -ItemType Directory -Path $run -Force | Out-Null
$owned = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()
$saved = @{}
$databaseCreated = $false

function Invoke-Owned([string]$File, [string[]]$Arguments, [string]$Directory, [int]$Seconds, [string]$Name) {
    $p = Start-Process -FilePath $File -ArgumentList $Arguments -WorkingDirectory $Directory -WindowStyle Hidden -PassThru -RedirectStandardOutput "$run/$Name.log" -RedirectStandardError "$run/$Name.error.log"
    $owned.Add($p)
    if (-not $p.WaitForExit($Seconds * 1000)) { throw "$Name exceeded $Seconds seconds; see $run" }
    if ($p.ExitCode -ne 0) { throw "$Name failed with exit code $($p.ExitCode); see $run" }
}

try {
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) { throw "Port $Port is already in use." }
    if (-not (Select-String -LiteralPath "$source/frontend/projects/qbc-workboard/src/app/features/assistant-hours/assistant-hours-page.component.html" -Pattern 'Log across stories' -Quiet)) {
        throw 'SourceRoot must contain feature/group-time-logging (54a135a) or a descendant with the feature.'
    }
    if (-not $SkipBuild) {
        Invoke-Owned 'cmd.exe' @('/d', '/c', 'npm ci && npm run build') "$source/frontend" 600 'frontend-build'
        Invoke-Owned 'dotnet.exe' @('publish', 'backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj', '-c', 'Release', '-p:SkipFrontendBuild=true', '-o', 'artifacts/demo-publish') $source 300 'publish'
    }
    if (-not (Test-Path "$publish/wwwroot/index.html")) { throw 'Published frontend missing. Run without -SkipBuild.' }
    # This name is generated here, never inherited from development configuration.
    if ($database -notmatch '^QbcDemo_[a-f0-9]{32}$') { throw 'Invalid disposable database name.' }
    & sqlcmd -S '.\SQLEXPRESS' -d master -E -C -b -l 15 -t 30 -Q "CREATE DATABASE [$database]" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the disposable database.' }
    $databaseCreated = $true
    $values = @{
        ConnectionStrings__Workboard = "Server=.\SQLEXPRESS;Database=$database;Trusted_Connection=True;TrustServerCertificate=True"
        SeedDevelopmentData = 'true'
        Access__InitialPasscode = (Get-Random -Minimum 1000 -Maximum 10000).ToString()
        DEMO_BASE_URL = "http://127.0.0.1:$Port"
        DEMO_RUN_DIR = $run
        DEMO_SOURCE_REVISION = (& git -C $source rev-parse HEAD)
    }
    foreach ($key in $values.Keys) {
        $saved[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
        [Environment]::SetEnvironmentVariable($key, $values[$key], 'Process')
    }
    $api = Start-Process dotnet.exe -ArgumentList @('Qbc.Workboard.Api.dll', '--urls', "http://127.0.0.1:$Port") -WorkingDirectory $publish -WindowStyle Hidden -PassThru -RedirectStandardOutput "$run/api.log" -RedirectStandardError "$run/api.error.log"
    $owned.Add($api)
    @{ database = $database; apiPid = $api.Id; port = $Port; source = $source } | ConvertTo-Json | Set-Content "$run/owned-resources.json"
    $deadline = [DateTime]::UtcNow.AddSeconds(90)
    $ready = $false
    while ([DateTime]::UtcNow -lt $deadline) {
        if ($api.HasExited) { throw "API exited; see $run/api.log" }
        try {
            $version = Invoke-RestMethod "http://127.0.0.1:$Port/api/version" -TimeoutSec 2
            if ($version.commit -ne $values.DEMO_SOURCE_REVISION) { throw 'Unexpected API revision.' }
            $ready = $true
            break
        } catch { Start-Sleep -Milliseconds 400 }
    }
    if (-not $ready) { throw 'API did not become ready in 90 seconds.' }
    Invoke-Owned 'node.exe' @('frontend/scripts/demo/group-hours.mjs') $repo 300 'recording'
    Write-Output "Staged take: $run"
    Write-Output 'Review the encoded video, then run review-group-hours.mjs and promote-group-hours.mjs as documented.'
} finally {
    foreach ($p in $owned) {
        if (-not $p.HasExited) {
            # Kill only a process tree started by this invocation.
            $p.Kill($true)
            if (-not $p.WaitForExit(15000)) { Write-Warning "Process $($p.Id) remains running." }
        }
    }
    foreach ($key in $saved.Keys) { [Environment]::SetEnvironmentVariable($key, $saved[$key], 'Process') }
    if ($databaseCreated) {
        if ($database -notmatch '^QbcDemo_[a-f0-9]{32}$') { throw 'Refusing cleanup of a non-demo database.' }
        & sqlcmd -S '.\SQLEXPRESS' -d master -E -C -b -l 15 -t 30 -Q "ALTER DATABASE [$database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$database]" | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Cleanup failed. Disposable database remaining: $database" }
    }
}
