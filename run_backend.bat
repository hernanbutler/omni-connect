@echo off
title OmniConnect Backend Server
color 0A

echo ========================================
echo   OMNICONNECT BACKEND SERVER
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en PATH
    echo Por favor instala Python desde https://www.python.org
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Verificar si existe requirements.txt e instalar dependencias
if exist requirements.txt (
    echo Instalando/actualizando dependencias...
    pip install -r requirements.txt --quiet
    echo [OK] Dependencias actualizadas
    echo.
) else (
    echo [AVISO] No se encontró requirements.txt
    echo Instalando dependencias básicas...
    pip install fastapi uvicorn pandas --quiet
    echo.
)

REM Verificar que exista el directorio de datos
if not exist data (
    echo [AVISO] No existe el directorio 'data'
    echo Creando directorio...
    mkdir data
)

echo ========================================
echo   INICIANDO SERVIDOR...
echo ========================================
echo.
echo El servidor estará disponible en:
echo   - Local:   http://localhost:8000
echo   - Network: http://127.0.0.1:8000
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

REM Iniciar el servidor
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

pause