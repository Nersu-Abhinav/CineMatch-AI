# ==========================================
# CineMatch AI - One Click Launcher
# ==========================================

$ProjectRoot = $PSScriptRoot

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "           CINEMATCH AI" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# ------------------------------------------
# Check virtual environment
# ------------------------------------------

$Python = Join-Path $ProjectRoot "venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {

    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red

    Read-Host "Press Enter to exit"

    exit
}


Write-Host "Starting backend..." -ForegroundColor Cyan


# ------------------------------------------
# Start FastAPI backend
# ------------------------------------------

Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$ProjectRoot'; & '$Python' -m uvicorn backend.main:app --reload"


Start-Sleep -Seconds 3


# ------------------------------------------
# Start frontend
# ------------------------------------------

Write-Host "Starting frontend..." -ForegroundColor Cyan


$Frontend = Join-Path $ProjectRoot "frontend"


Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$Frontend'; & '$Python' -m http.server 5500"


Start-Sleep -Seconds 3


# ------------------------------------------
# Open browser
# ------------------------------------------

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "       CINEMATCH AI IS RUNNING" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Website:"
Write-Host "http://127.0.0.1:5500" -ForegroundColor Yellow

Write-Host ""

Start-Process "http://127.0.0.1:5500"


Write-Host "Browser opened."
Write-Host ""
Write-Host "You can close this launcher window."