@echo off
echo Iniciando proyecto ODON-SYS completo...

:: Ruta del backend
echo [1/3] Iniciando Backend (Puerto 5000)...
start "Backend" cmd /k "cd /d %~dp0backend && npm install && npm start"

:: Esperar 5 segundos antes de abrir el frontend principal
timeout /t 5 > nul

:: Ruta del frontend principal
echo [2/3] Iniciando Frontend Principal (Puerto 3000)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm start"

:: Esperar 3 segundos antes de abrir el panel admin
timeout /t 3 > nul

:: Ruta del panel administrativo
echo [3/3] Iniciando Panel Administrativo (Puerto 3001)...
start "Admin Panel" cmd /k "cd /d %~dp0hk && npm install && set PORT=3001 && npm start"

echo.
echo ===============================================
echo   ODON-SYS - Sistema Completo Iniciado
echo ===============================================
echo   Backend:          http://localhost:5000
echo   Frontend:         http://localhost:3000  
echo   Panel Admin:      http://localhost:3001
echo ===============================================
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
exit