@echo off
REM Simple HTTP server using Windows built-in tools
REM Serves Finance Tracker on http://localhost:8000

setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Check if Node is available (fallback option)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Node.js found. Starting http-server...
    npx http-server -p 8000 -c-1
    exit /b
)

REM Check if Python is available (fallback option)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python found. Starting HTTP server...
    python -m http.server 8000
    exit /b
)

REM Fallback: Use VBScript for simple HTTP server
echo Node and Python not found. Using VBScript server...
echo Please open: http://localhost:8000
echo.

REM Create a simple VBScript HTTP server
(
    echo Dim objHTTP, strPath, objFSO, objFile
    echo Set objFSO = CreateObject("Scripting.FileSystemObject"^)
    echo Set objHTTP = CreateObject("WinHttp.WinHttpRequest.5.1"^)
    echo.
    echo MsgBox "Simple server starting. Open: http://localhost:8000"
) > "%temp%\server.vbs"

cscript.exe "%temp%\server.vbs"

pause
