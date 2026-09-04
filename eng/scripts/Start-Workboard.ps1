<#
.SYNOPSIS
    Runs the QBC Workboard backend and frontend, then opens the app in Chrome.

.DESCRIPTION
    Starts the ASP.NET Core API and the Angular dev server, waits until each one
    actually answers, opens http://localhost:4200 in Chrome, and then keeps running
    until you press Ctrl+C. Both child processes are stopped on exit.

    The API runs in the Development environment, so it seeds the representative
    workspace from the mocks. The Angular dev server proxies /api and /openapi to the
    API, so the browser only ever talks to one origin and CORS never enters into it.

.PARAMETER BackendPort
    Port for the API. Default 5050. The proxy configuration is generated to match, so
    changing this needs no edit to frontend/proxy.conf.json.

.PARAMETER FrontendPort
    Port for the Angular dev server. Default 4200.

.PARAMETER Configuration
    Build configuration for the API. Default Debug.

.PARAMETER Environment
    ASPNETCORE_ENVIRONMENT for the API. Default Development, which enables seeding.
    There is no launchSettings.json in this repository, so without this the API would
    start in Production and come up with an empty workspace.

.PARAMETER NoBrowser
    Start both servers but do not open a browser.

.PARAMETER SkipInstall
    Never run npm ci, even when frontend/node_modules is missing.

.PARAMETER TimeoutSeconds
    How long to wait for each server to answer. Default 240.

.EXAMPLE
    pwsh ./eng/scripts/Start-Workboard.ps1

.EXAMPLE
    pwsh ./eng/scripts/Start-Workboard.ps1 -BackendPort 5100 -FrontendPort 4300 -NoBrowser
#>
[CmdletBinding()]
param(
    [ValidateRange(1, 65535)] [int]$BackendPort = 5050,
    [ValidateRange(1, 65535)] [int]$FrontendPort = 4200,
    [ValidateSet('Debug', 'Release')] [string]$Configuration = 'Debug',
    [string]$Environment = 'Development',
    [switch]$NoBrowser,
    [switch]$SkipInstall,
    [ValidateRange(30, 3600)] [int]$TimeoutSeconds = 240
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$engRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $engRoot
$apiProject = Join-Path $repoRoot 'backend/src/Qbc.Workboard.Api/Qbc.Workboard.Api.csproj'
$frontendDir = Join-Path $repoRoot 'frontend'
$logDir = Join-Path $engRoot 'logs'

$backendUrl = "http://localhost:$BackendPort"
$frontendUrl = "http://localhost:$FrontendPort"

# Tracked children, stopped in the finally block whatever happens.
$script:Started = [System.Collections.Generic.List[object]]::new()

# Declared up front because the finally block reads it, and StrictMode treats an
# unassigned variable as an error rather than as $null.
$proxyConfig = $null

function Write-Step {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Detail {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "    $Message" -ForegroundColor DarkGray
}

function Resolve-Tool {
    <#  npm and npx are .cmd shims on Windows, and Start-Process will not launch a
        bare "npm". Resolve to whatever actually exists on this machine. #>
    param([Parameter(Mandatory)][string]$Name, [Parameter(Mandatory)][string]$Purpose)

    foreach ($candidate in @("$Name.cmd", "$Name.exe", $Name)) {
        $command = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($null -ne $command) { return $command.Source }
    }
    throw "Could not find '$Name' on PATH, which is required to $Purpose."
}

function Test-PortFree {
    param([Parameter(Mandatory)][int]$Port)

    $getConnection = Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue
    if ($null -ne $getConnection) {
        $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
        return $listeners.Count -eq 0
    }

    # Fallback for hosts without the NetTCPIP module.
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch { return $false }
}

function Assert-PortFree {
    param([Parameter(Mandatory)][int]$Port, [Parameter(Mandatory)][string]$Purpose)

    if (Test-PortFree -Port $Port) { return }

    $owner = ''
    $getConnection = Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue
    if ($null -ne $getConnection) {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($null -ne $listener) {
            $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
            if ($null -ne $process) { $owner = " It is held by $($process.ProcessName) (PID $($process.Id))." }
        }
    }

    throw "Port $Port is already in use, so the $Purpose cannot start.$owner Stop it, or pass a different port."
}

function Start-Tracked {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)][string[]]$Arguments,
        [Parameter(Mandatory)][string]$WorkingDirectory,
        [hashtable]$EnvironmentVariables = @{}
    )

    $outLog = Join-Path $logDir "$Name.log"
    $errLog = Join-Path $logDir "$Name.err.log"

    # Start-Process reads the current process environment, so set, launch, restore.
    $previous = @{}
    foreach ($key in $EnvironmentVariables.Keys) {
        $previous[$key] = [Environment]::GetEnvironmentVariable($key)
        [Environment]::SetEnvironmentVariable($key, $EnvironmentVariables[$key])
    }

    try {
        $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments `
            -WorkingDirectory $WorkingDirectory -NoNewWindow -PassThru `
            -RedirectStandardOutput $outLog -RedirectStandardError $errLog
    }
    finally {
        foreach ($key in $previous.Keys) {
            [Environment]::SetEnvironmentVariable($key, $previous[$key])
        }
    }

    $entry = [pscustomobject]@{ Name = $Name; Process = $process; Log = $outLog; ErrorLog = $errLog }
    $script:Started.Add($entry)
    Write-Detail "PID $($process.Id) · logging to eng/logs/$Name.log"
    return $entry
}

function Stop-Tracked {
    if ($script:Started.Count -eq 0) { return }

    Write-Step 'Stopping'
    # These are launcher processes: dotnet run spawns the real host, npx spawns node.
    # Killing only the launcher would strand the server holding the port, so take the
    # whole tree.
    foreach ($entry in $script:Started) {
        if ($entry.Process.HasExited) {
            Write-Detail "$($entry.Name) had already exited."
            continue
        }
        & taskkill.exe /PID $entry.Process.Id /T /F 2>&1 | Out-Null
        Write-Detail "Stopped $($entry.Name) (PID $($entry.Process.Id)) and its children."
    }
    $script:Started.Clear()
}

function Get-LogTail {
    param([Parameter(Mandatory)][object]$Entry, [int]$Lines = 20)

    $output = @()
    foreach ($path in @($Entry.ErrorLog, $Entry.Log)) {
        if (Test-Path -LiteralPath $path) {
            $tail = @(Get-Content -LiteralPath $path -Tail $Lines -ErrorAction SilentlyContinue)
            if ($tail.Count -gt 0) { $output += "--- $(Split-Path -Leaf $path) ---"; $output += $tail }
        }
    }
    return ($output -join [Environment]::NewLine)
}

function Wait-ForHttp {
    param(
        [Parameter(Mandatory)][string]$Url,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][object]$Entry,
        [Parameter(Mandatory)][int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $spinner = '|/-\'
    $tick = 0

    while ((Get-Date) -lt $deadline) {
        # A server that died is never going to answer, so stop waiting on it.
        if ($Entry.Process.HasExited) {
            Write-Host ''
            throw "$Name exited with code $($Entry.Process.ExitCode) before it answered.$([Environment]::NewLine)$(Get-LogTail -Entry $Entry)"
        }

        try {
            # The API answers 401 until a passcode is entered, and a server that refuses a
            # request has still started. Without -SkipHttpErrorCheck that 401 throws, lands in
            # the catch below, and the wait never ends.
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -SkipHttpErrorCheck -ErrorAction Stop
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                Write-Host "`r    $Name is up.                    "
                return
            }
        }
        catch {
            # Connection refused while it boots is expected; keep waiting.
        }

        Write-Host "`r    waiting for $Name $($spinner[$tick % 4])" -NoNewline
        $tick++
        Start-Sleep -Milliseconds 700
    }

    Write-Host ''
    throw "$Name did not answer $Url within $TimeoutSeconds seconds.$([Environment]::NewLine)$(Get-LogTail -Entry $Entry)"
}

function Find-Chrome {
    $candidates = @(
        (Join-Path $env:ProgramFiles 'Google/Chrome/Application/chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Google/Chrome/Application/chrome.exe'),
        (Join-Path $env:LOCALAPPDATA 'Google/Chrome/Application/chrome.exe')
    )
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
    }

    $command = Get-Command 'chrome.exe' -ErrorAction SilentlyContinue
    if ($null -ne $command) { return $command.Source }

    # Chrome registers its install location here even when it is not on PATH.
    $registryPath = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe'
    if (Test-Path $registryPath) {
        $value = (Get-ItemProperty -Path $registryPath -ErrorAction SilentlyContinue).'(default)'
        if ($value -and (Test-Path -LiteralPath $value)) { return $value }
    }

    return $null
}

try {
    Write-Step 'Checking prerequisites'

    if (-not (Test-Path -LiteralPath $apiProject)) { throw "API project not found at $apiProject." }
    if (-not (Test-Path -LiteralPath $frontendDir)) { throw "Frontend workspace not found at $frontendDir." }

    $dotnet = Resolve-Tool -Name 'dotnet' -Purpose 'build and run the API'
    $npm = Resolve-Tool -Name 'npm' -Purpose 'install frontend dependencies'
    $node = Resolve-Tool -Name 'node' -Purpose 'run the Angular dev server'
    Write-Detail "dotnet $(& $dotnet --version)"
    Write-Detail "node $(& node --version)"

    Assert-PortFree -Port $BackendPort -Purpose 'API'
    Assert-PortFree -Port $FrontendPort -Purpose 'Angular dev server'
    Write-Detail "Ports $BackendPort and $FrontendPort are free."

    New-Item -ItemType Directory -Path $logDir -Force | Out-Null

    if (-not (Test-Path -LiteralPath (Join-Path $frontendDir 'node_modules'))) {
        if ($SkipInstall) {
            throw 'frontend/node_modules is missing and -SkipInstall was passed. Run npm ci in frontend first.'
        }
        Write-Step 'Installing frontend dependencies (npm ci)'
        Push-Location $frontendDir
        try {
            & $npm ci
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE." }
        }
        finally { Pop-Location }
    }

    # The committed proxy config hard-codes port 5050. Generate one that matches the
    # port actually in use, so -BackendPort works without editing a tracked file.
    $proxyConfig = Join-Path ([System.IO.Path]::GetTempPath()) "qbc-workboard-proxy-$PID.json"
    @{
        '/api'     = @{ target = $backendUrl; secure = $false; changeOrigin = $true }
        '/openapi' = @{ target = $backendUrl; secure = $false; changeOrigin = $true }
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $proxyConfig -Encoding utf8

    Write-Step "Starting the API on $backendUrl"
    $backendEntry = Start-Tracked -Name 'backend' -FilePath $dotnet -WorkingDirectory $repoRoot `
        -Arguments @('run', '--project', $apiProject, '--configuration', $Configuration, '--urls', $backendUrl) `
        -EnvironmentVariables @{ ASPNETCORE_ENVIRONMENT = $Environment }
    Wait-ForHttp -Url "$backendUrl/api/workspace" -Name 'API' -Entry $backendEntry -TimeoutSeconds $TimeoutSeconds

    Write-Step "Starting the Angular dev server on $frontendUrl"
    Write-Detail "Proxying /api and /openapi to $backendUrl"
    <#  Served through scripts/build-app.mjs rather than "ng serve" directly, because that is
        where QBC_FRONTEND_VERSION and QBC_FRONTEND_COMMIT are defined. Without them the
        application throws "QBC_FRONTEND_VERSION is not defined" on boot and renders nothing. #>
    $frontendEntry = Start-Tracked -Name 'frontend' -FilePath $node -WorkingDirectory $frontendDir `
        -Arguments @('scripts/build-app.mjs', 'serve', '--port', $FrontendPort, '--proxy-config', $proxyConfig)
    Wait-ForHttp -Url $frontendUrl -Name 'Angular dev server' -Entry $frontendEntry -TimeoutSeconds $TimeoutSeconds

    if (-not $NoBrowser) {
        Write-Step "Opening $frontendUrl"
        $chrome = Find-Chrome
        if ($null -ne $chrome) {
            Start-Process -FilePath $chrome -ArgumentList @($frontendUrl) | Out-Null
            Write-Detail "Chrome: $chrome"
        }
        else {
            Write-Warning 'Chrome was not found. Opening the default browser instead.'
            Start-Process $frontendUrl | Out-Null
        }
    }

    Write-Host ''
    Write-Host 'QBC Workboard is running.' -ForegroundColor Green
    Write-Host "  App          $frontendUrl"
    Write-Host "  API          $backendUrl/api/workspace"
    Write-Host "  Environment  $Environment (seeds the representative workspace)"
    Write-Host "  Logs         eng/logs/backend.log, eng/logs/frontend.log"
    Write-Host ''
    Write-Host 'Press Ctrl+C to stop both servers.' -ForegroundColor Yellow

    # Hold the script open so the finally block owns the shutdown. If either server
    # falls over on its own, say so rather than sitting here forever.
    while ($true) {
        Start-Sleep -Seconds 1
        foreach ($entry in @($script:Started)) {
            if ($entry.Process.HasExited) {
                Write-Host ''
                Write-Warning "$($entry.Name) exited with code $($entry.Process.ExitCode)."
                Write-Host (Get-LogTail -Entry $entry)
                return
            }
        }
    }
}
finally {
    Stop-Tracked
    if ($null -ne $proxyConfig -and (Test-Path -LiteralPath $proxyConfig)) {
        Remove-Item -LiteralPath $proxyConfig -Force -ErrorAction SilentlyContinue
    }
}
