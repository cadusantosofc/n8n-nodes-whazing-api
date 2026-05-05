@echo off
setlocal
title n8n Dev - Whazing Node

:: Como o arquivo esta dentro da pasta do projeto, usamos %~dp0 para pegar o caminho atual
set PROJECT_DIR=%~dp0

:: Entra na pasta do projeto (onde o .bat esta)
cd /d "%PROJECT_DIR%"

echo ========================================================
echo   Iniciando Whazing Node em modo Desenvolvimento
echo ========================================================
echo.

:: Define a variavel para o n8n carregar o node local
set N8N_CUSTOM_EXTENSIONS=%PROJECT_DIR%

:: Pergunta se deseja fazer o build antes de iniciar
set /p build=Deseja realizar o build antes de iniciar? (s/n): 

if /i "%build%"=="s" (
    echo Executando npm run build...
    call npm run build
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha no build. Verifique o codigo.
        pause
        exit /b %errorlevel%
    )
)

echo.
echo Iniciando n8n...
echo [Acesse http://localhost:5678 para testar]
echo.

:: Inicia o n8n
npx n8n start

pause