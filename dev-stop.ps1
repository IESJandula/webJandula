# dev-stop.ps1 — Para los procesos node que ocupan los puertos de desarrollo
$ports = @(3001, 5173, 4321)

foreach ($port in $ports) {
    $pid = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
    if ($pid) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "Parando proceso en puerto $port (PID $pid — $($proc.Name))..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
        }
    } else {
        Write-Host "Puerto $port ya libre." -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Servicios detenidos." -ForegroundColor Green
