@echo off
echo ================================================
echo FIMS App Configuration Check
echo ================================================
echo.

cd /d %~dp0

echo Checking app.json...
findstr /C:"jsEngine" app.json
echo.

echo Checking gradle.properties...
findstr /C:"hermesEnabled" android\gradle.properties
echo.

echo Checking build.gradle version...
findstr /C:"versionCode" android\app\build.gradle
findstr /C:"versionName" android\app\build.gradle
echo.

echo ================================================
echo Configuration Summary:
echo ================================================
echo Expected values:
echo   - jsEngine: "hermes" (in app.json)
echo   - hermesEnabled=true (in gradle.properties)
echo   - versionCode: 3
echo   - versionName: "1.0.2"
echo ================================================
echo.
pause
