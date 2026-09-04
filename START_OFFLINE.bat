@echo off
chcp 65001 >nul
title Fayzar Computer Offline Server Launcher

echo =======================================================
echo          FAYZAR COMPUTER OFFLINE SERVER
echo =======================================================
echo.
echo Checking Python environment...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Python is not found in PATH!
    echo Opening index.html directly in your default browser...
    start "" "%~dp0index.html"
    pause
    exit /b
)

echo Starting local offline server with API support...
echo Server running at: http://localhost:3000/
echo Opening browser...
echo.
echo Press Ctrl+C in this window to stop the server when done.
echo =======================================================

cd /d "%~dp0"
python serve_offline.py
pause
