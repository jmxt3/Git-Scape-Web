# deploy.ps1
# Runs Cloud Build for the /api and /web services in sequence.
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

function Deploy-Service {
    param (
        [string]$ServiceName,
        [string]$ServicePath
    )

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Deploying: $ServiceName" -ForegroundColor Cyan
    Write-Host "  Path:      $ServicePath" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    if (-not (Test-Path $ServicePath)) {
        Write-Host "[ERROR] Directory not found: $ServicePath" -ForegroundColor Red
        exit 1
    }

    Push-Location $ServicePath
    try {
        gcloud builds submit --config cloudbuild.yaml .
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Cloud Build failed for $ServiceName (exit code $LASTEXITCODE)" -ForegroundColor Red
            exit $LASTEXITCODE
        }
        Write-Host "[OK] $ServiceName deployed successfully." -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

Deploy-Service -ServiceName "API"  -ServicePath (Join-Path $ScriptDir "api")
Deploy-Service -ServiceName "Web"  -ServicePath (Join-Path $ScriptDir "web")

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services deployed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
