@echo off
color 0A
title KirosyaPanel Kurulumu
echo ========================================================
echo KirosyaPanel Kurulumuna Hosgeldiniz (v0.0.1)
echo ========================================================
echo.
echo Kurulum dosyalariniz hazirlaniyor...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Runteryaa/sb-aspava/main/print-server/KirosyaPanel.exe' -OutFile '.\KirosyaPanel.exe' -ErrorAction SilentlyContinue"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"

echo.
echo Kurulum Tamamlandi! Cikmak icin bir tusa basin...
pause >nul
