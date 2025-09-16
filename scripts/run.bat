@echo off
REM Script de execução do HTML to Image Converter
echo.
echo ========================================
echo  HTML to Image Converter v1.0
echo ========================================
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo Execute scripts\install.bat primeiro
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo ❌ Dependências não instaladas!
    echo Execute scripts\install.bat primeiro
    pause
    exit /b 1
)

REM Executar o conversor com os argumentos passados
echo 🚀 Executando HTML to Image Converter...
echo.
node index.js %*

echo.
echo ✨ Execução concluída!
echo.
pause