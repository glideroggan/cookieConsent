#!/usr/bin/env pwsh
# Pre-Docker build script to prepare admin panel

Write-Host "🐳 Preparing Docker build..." -ForegroundColor Blue

# Build admin panel first
Write-Host "📦 Building admin panel..." -ForegroundColor Yellow
Set-Location demo
yarn build:admin

if (Test-Path "admin-dist") {
    Write-Host "✅ Admin panel built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build admin panel" -ForegroundColor Red
    exit 1
}

# Return to root
Set-Location ..

Write-Host "🚀 Ready for Docker build!" -ForegroundColor Green
Write-Host ""
Write-Host "Run: docker-compose up --build" -ForegroundColor Cyan
