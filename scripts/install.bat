@echo off
REM Script de instalação do HTML to Image Converter
echo.
echo ========================================
echo  HTML to Image Converter v1.0
echo  Script de Instalação
echo ========================================
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version

REM Verificar se o npm está disponível
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)

echo ✅ npm encontrado:
npm --version
echo.

REM Instalar dependências
echo 📦 Instalando dependências...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erro na instalação das dependências!
    pause
    exit /b 1
)

echo.
echo ✅ Instalação concluída com sucesso!
echo.
echo 🚀 Para começar a usar:
echo   node index.js --help
echo.
echo 📖 Documentação disponível em: docs\
echo.
pause
