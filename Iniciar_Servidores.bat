@echo off
chcp 65001 >nul
title Iniciar Servidores - Consulta de Lotes

cd /d "%~dp0"

if not exist "%~dp0.venv\Scripts\python.exe" (
    echo ERRO: nao encontrei o Python em "%~dp0.venv\Scripts\python.exe"
    echo Verifique se o ambiente virtual ^(.venv^) existe na raiz do projeto.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\node_modules" (
    echo ERRO: nao encontrei "%~dp0frontend\node_modules"
    echo Rode "npm install" dentro da pasta frontend antes de usar este atalho.
    pause
    exit /b 1
)

echo ============================================================
echo   Iniciando servidores - Consulta de Lotes
echo ============================================================
echo.
echo Backend  (FastAPI) : http://localhost:8000
echo Frontend (Vite)    : http://localhost:3000
echo.
echo Cada servidor abre em sua propria janela. Para parar, feche
echo as janelas "Backend" e "Frontend" (ou Ctrl+C em cada uma).
echo.

start "Backend"  cmd /k "cd /d "%~dp0backend" && "%~dp0.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Aguardando os servidores subirem...
timeout /t 6 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo Pronto! O navegador deve abrir sozinho em alguns segundos.
echo Esta janela pode ser fechada - os servidores continuam rodando
echo nas janelas "Backend" e "Frontend".
echo.
pause
