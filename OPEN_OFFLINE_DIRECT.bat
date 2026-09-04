@echo off
chcp 65001 >nul
title Fayzar Computer Direct Launcher

echo =======================================================
echo          FAYZAR COMPUTER DIRECT OFFLINE LAUNCHER
echo =======================================================
echo.
echo Opening index.html directly in your default browser...
start "" "%~dp0index.html"
echo.
echo Done! Website opened in browser.
exit
