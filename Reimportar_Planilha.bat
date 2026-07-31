@echo off
chcp 65001 >nul
title Reimportar Planilha - Consulta de Lotes

cd /d "%~dp0backend"

if exist "%~dp0.venv\Scripts\python.exe" goto run

echo ERRO: nao encontrei o Python em "%~dp0.venv\Scripts\python.exe"
echo Verifique se o ambiente virtual (.venv) existe na raiz do projeto.
pause
exit /b 1

:run
echo ============================================================
echo   Reimportar dados da planilha Google Sheets para o Supabase
echo ============================================================
echo.
echo Este processo vai APAGAR todos os lotes atuais no Supabase e
echo importar os dados atuais da planilha do zero.
echo.

"%~dp0.venv\Scripts\python.exe" scripts\resync_sheets_to_supabase.py

echo.
echo ============================================================
echo Processo encerrado. Feche esta janela quando terminar de ler.
echo ============================================================
pause
