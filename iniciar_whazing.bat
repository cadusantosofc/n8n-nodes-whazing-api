@echo off
setlocal
title n8n Dev - Whazing Node (Hot Reload)

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo ========================================================
echo   Iniciando Whazing Node em modo Desenvolvimento
echo              [HOT RELOAD ATIVADO]
echo ========================================================
echo.

set N8N_CUSTOM_EXTENSIONS=%PROJECT_DIR%

echo [1/3] Instalando nodemon localmente (se necessario)...
call npm install --save-dev nodemon 2>nul
echo.

echo [2/3] Executando build inicial...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha no build. Verifique o codigo.
    pause
    exit /b %errorlevel%
)
echo [OK] Build concluido.
echo.

echo [3/3] Abrindo TypeScript Watch em janela separada...
start "TS Watch - Whazing" cmd /k "cd /d %PROJECT_DIR% && npx tsc --watch --preserveWatchOutput"

echo.
echo Iniciando n8n com nodemon (hot reload)...
echo [Acesse http://localhost:5678]
echo [n8n reinicia automaticamente ao salvar qualquer .ts]
echo.

call node_modules\.bin\nodemon --watch dist --ext js,json --delay 1500ms --exec "npx n8n start"

pause