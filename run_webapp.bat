@echo off
title OmniConnect WebApp Server
color 0B

echo ========================================
echo   OMNICONNECT WEBAPP SERVER
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en el PATH.
    echo Por favor, instala Python desde https://www.python.org
    pause
    exit /b 1
)

echo [OK] Python encontrado.
echo.
echo Iniciando servidor web para la aplicación...
echo La aplicación estará disponible en: http://localhost:5500
echo.
echo Presiona Ctrl+C para detener el servidor.
echo ========================================
echo.

REM Start the web server and open the browser
start http://localhost:5500
cd WEBAPP
python -m http.server 5500
