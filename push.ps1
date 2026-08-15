# ==========================================
# CineMatch AI — One Click GitHub Pusher
# ==========================================

$ProjectRoot = $PSScriptRoot

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "       CINEMATCH AI - GITHUB PUSHER" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

Set-Location $ProjectRoot

Write-Host "Checking git status..." -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "Pushing code to GitHub repository..." -ForegroundColor Cyan
Write-Host "Target: https://github.com/Nersu-Abhinav/CineMatch-AI.git" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "    SUCCESSFULLY PUSHED TO GITHUB!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repository at:"
    Write-Host "https://github.com/Nersu-Abhinav/CineMatch-AI" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed. If GitHub requested authentication, log in via browser or enter your Personal Access Token." -ForegroundColor Red
}

Read-Host "Press Enter to exit"
