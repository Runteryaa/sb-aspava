$InstallDir = "C:\KirosyaPanel"

Write-Host "KirosyaPanel Kurulumu Basliyor..."
Write-Host "Hedef klasor: $InstallDir"

if (-Not (Test-Path -Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
    Write-Host "Klasor olusturuldu."
}

if (-Not (Test-Path -Path "$InstallDir\receipts")) {
    New-Item -ItemType Directory -Path "$InstallDir\receipts" | Out-Null
}

$ExePath = ".\KirosyaPanel.exe"
if (Test-Path -Path $ExePath) {
    Copy-Item -Path $ExePath -Destination "$InstallDir\KirosyaPanel.exe" -Force
    Write-Host "KirosyaPanel.exe kopyalandi."
} else {
    Write-Host "HATA: KirosyaPanel.exe bulunamadi!"
    Exit 1
}

# Baslangica ekle
$StartupFolder = [Environment]::GetFolderPath("Startup")
$ShortcutPath = Join-Path $StartupFolder "KirosyaPanel.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "$InstallDir\KirosyaPanel.exe"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "KirosyaPanel Print Server"
$Shortcut.Save()

Write-Host "Baslangic kisayolu olusturuldu: $ShortcutPath"

# Uygulamayi baslat
Start-Process -FilePath "$InstallDir\KirosyaPanel.exe" -WorkingDirectory $InstallDir

Write-Host "Kurulum tamamlandi! Uygulama baslatildi."
Start-Sleep -Seconds 3
