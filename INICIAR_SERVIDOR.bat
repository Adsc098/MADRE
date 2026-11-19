@echo off
title Servidor SICEP - Sistema Escolar MySQL
color 0A
cd /d "%~dp0"

echo ================================================================
echo           SISTEMA ESCOLAR SICEP - SERVIDOR MYSQL
echo ================================================================
echo.
echo [1/2] Abriendo el sistema en tu navegador...
start http://localhost:3000
echo.
echo [2/2] Servidor MySQL activo en http://localhost:3000
echo.
echo   * NOTA: Deja esta ventana abierta mientras utilices el sistema.
echo   * Para apagar el servidor, simplemente cierra esta ventana.
echo ================================================================
echo.

python server\server.py
pause
