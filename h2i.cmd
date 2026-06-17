@echo off
REM Local wrapper para executar o CLI h2i sem instalação global.
REM Uso:
REM   h2i --help
REM   h2i --range 3-6
REM   h2i work\htmls\02.html

setlocal
set "SCRIPT_DIR=%~dp0"
node "%SCRIPT_DIR%bin\html-to-image.js" %*

