# dev-start.ps1 — Arranca backend, panel y frontend en terminales separadas
$root = $PSScriptRoot

Write-Host "Arrancando backend  (puerto 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; npm run dev" -WindowStyle Normal

Write-Host "Arrancando panel    (puerto 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\panel'; npm run dev" -WindowStyle Normal

Write-Host "Arrancando frontend (puerto 4321)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Servicios arrancados:" -ForegroundColor Green
Write-Host "  Backend  -> http://localhost:3001"
Write-Host "  Panel    -> http://localhost:5173"
Write-Host "  Frontend -> http://localhost:4321"
