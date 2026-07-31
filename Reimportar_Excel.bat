@echo off
chcp 65001 >nul
title Reimportar Excel - Consulta de Lotes

cd /d "%~dp0backend"

if exist "%~dp0.venv\Scripts\python.exe" goto check_file

echo ERRO: nao encontrei o Python em "%~dp0.venv\Scripts\python.exe"
echo Verifique se o ambiente virtual (.venv) existe na raiz do projeto.
pause
exit /b 1

:check_file
set "ARQUIVO=%~1"

if not "%ARQUIVO%"=="" goto run

echo ============================================================
echo   Reimportar dados de um arquivo Excel para o Supabase
echo ============================================================
echo.
echo Dica: da proxima vez, arraste o arquivo Excel em cima deste
echo .bat que ele ja abre com o caminho preenchido.
echo.
set /p ARQUIVO="Digite (ou cole) o caminho completo do arquivo Excel: "

if "%ARQUIVO%"=="" (
    echo Nenhum arquivo informado. Cancelado.
    pause
    exit /b 1
)

:run
if not exist "%ARQUIVO%" (
    echo ERRO: arquivo nao encontrado: %ARQUIVO%
    pause
    exit /b 1
)

echo ============================================================
echo   Reimportar dados de um arquivo Excel para o Supabase
echo ============================================================
echo.
echo Arquivo selecionado: %ARQUIVO%
echo.
echo Este processo vai APAGAR todos os lotes atuais no Supabase e
echo importar os dados atuais deste arquivo do zero.
echo.

"%~dp0.venv\Scripts\python.exe" scripts\resync_excel_to_supabase.py "%ARQUIVO%"

echo.
echo ============================================================
echo Processo encerrado. Feche esta janela quando terminar de ler.
echo ============================================================
pause
