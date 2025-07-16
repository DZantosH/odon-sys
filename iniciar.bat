@echo off
echo Iniciando proyecto ODON-SYS...

:: Ruta del backend
start "Backend" cmd /k "cd /d %~dp0backend && npm install && npm start"

:: Esperar 3 segundos antes de abrir el frontend
timeout /t 3 > nul

:: Ruta del frontend
start "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm start"

exit