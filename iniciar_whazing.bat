@echo off
setlocal enabledelayedexpansion
title n8n Dev - Whazing Node (Hot Reload)

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo ========================================================
echo   Iniciando Whazing Node em modo Desenvolvimento
echo              [HOT RELOAD ATIVADO]
echo ========================================================
echo.

set N8N_CUSTOM_EXTENSIONS=%PROJECT_DIR%

REM Mata qualquer n8n que esteja rodando na porta 5678
echo [0] Verificando porta 5678...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5678" ^| findstr "LISTENING"') do (
    echo     Matando processo PID %%a na porta 5678...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo [OK] Porta 5678 livre.
echo.

echo [1/2] Executando build inicial...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha no build. Verifique o codigo.
    pause
    exit /b %errorlevel%
)
echo [OK] Build concluido com sucesso.
echo.

echo [2/2] Iniciando n8n em modo dev (hot reload automatico)...
echo.
echo [Acesse http://localhost:5678]
echo [Salve qualquer arquivo .ts para recompilar automaticamente]
echo [O n8n reinicia quando detecta mudancas no dist/]
echo.

REM Inicia o tsc --watch em uma janela separada (background)
start "TSC Watch" /min cmd /c "cd /d "%PROJECT_DIR%" && npm run build:watch"

REM Aguarda o tsc inicializar
timeout /t 3 /nobreak >nul

REM Inicia o nodemon que observa a pasta dist/ e reinicia o n8n
npx nodemon --watch dist --ext js,json --delay 1500ms --exec "n8n start"

pause