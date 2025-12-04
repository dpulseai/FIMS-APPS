@echo off
echo ================================================
echo Building FIMS Android APK v1.0.3 with Hermes
echo ================================================
echo.

cd /d %~dp0

echo Step 1: Checking Hermes configuration...
findstr "hermesEnabled" android\gradle.properties
echo.

echo Step 2: Starting EAS Build...
echo This will take 15-20 minutes...
echo.

call npx eas-cli build --platform android --profile preview --non-interactive

if errorlevel 1 (
    echo.
    echo BUILD FAILED!
    echo Try running: npx expo prebuild --platform android --clean
    echo Then run this batch file again.
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ================================================
echo.
echo Download the APK from the link above
echo Then:
echo   1. UNINSTALL old app from phone
echo   2. Install new APK (v1.0.3)
echo   3. Test the app
echo.
pause
