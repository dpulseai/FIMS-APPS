@echo off
echo ========================================
echo FIMS App - Device Log Viewer
echo ========================================
echo.
echo Make sure your Android device is connected via USB
echo and USB debugging is enabled.
echo.
echo Press any key to start viewing logs...
pause >nul

echo.
echo Clearing old logs...
adb logcat -c

echo.
echo Starting log viewer (Press Ctrl+C to stop)...
echo Look for [FIMS], [App], [i18n], [Supabase], [useAuth] tags
echo.
adb logcat -v time | findstr /i "FIMS App i18n Supabase useAuth ReactNative AndroidRuntime FATAL"
