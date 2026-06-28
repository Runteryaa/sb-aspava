!macro preInit
  SetRegView 64
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\KirosyaPanel"
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\KirosyaPanel"
!macroend

!macro customInstallDir
  StrCpy $INSTDIR "C:\KirosyaPanel"
!macroend
