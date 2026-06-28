@echo off
color 0A
title KirosyaPanel Tek Tikla Kurulum
echo ========================================================
echo KirosyaPanel Kurulumuna Hosgeldiniz (v0.0.1)
echo ========================================================
echo.
echo [1/3] Kurulum klasoru hazirlaniyor...
set InstallDir=C:\KirosyaPanel
if not exist "%InstallDir%" mkdir "%InstallDir%"
if not exist "%InstallDir%\receipts" mkdir "%InstallDir%\receipts"

echo [2/3] Uygulama indiriliyor (Bu islem internet hizina gore 1-2 dakika surebilir)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Runteryaa/sb-aspava/main/print-server/KirosyaPanel.exe' -OutFile '%InstallDir%\KirosyaPanel.exe' -ErrorAction Stop"

if not exist "%InstallDir%\KirosyaPanel.exe" (
    color 0C
    echo HATA: Uygulama indirilemedi! Lutfen internet baglantinizi kontrol edin.
    pause
    exit /b 1
)

echo [3/3] Baslangic ayarlari yapiliyor...
set VBScript="%temp%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %VBScript%
echo sLinkFile = "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\KirosyaPanel.lnk" >> %VBScript%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %VBScript%
echo oLink.TargetPath = "%InstallDir%\KirosyaPanel.exe" >> %VBScript%
echo oLink.WorkingDirectory = "%InstallDir%" >> %VBScript%
echo oLink.Description = "KirosyaPanel Print Server" >> %VBScript%
echo oLink.Save >> %VBScript%
cscript //nologo %VBScript%
del %VBScript%

echo.
echo ========================================================
echo KURULUM TAMAMLANDI!
echo ========================================================
echo Uygulama simdi baslatiliyor...
start "" "%InstallDir%\KirosyaPanel.exe"

timeout /t 3 >nul
