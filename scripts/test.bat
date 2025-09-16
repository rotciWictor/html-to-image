@echo off
REM Script de testes do HTML to Image Converter
echo.
echo ========================================
echo  HTML to Image Converter v1.0
echo  Executando Testes
echo ========================================
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo ❌ Dependências não instaladas!
    echo Execute scripts\install.bat primeiro
    pause
    exit /b 1
)

REM Executar testes
echo 🧪 Executando testes unitários...
echo.
npm test

echo.
echo ✨ Testes concluídos!
echo.
pause
