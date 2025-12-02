# Script to view Android app logs
# Make sure your device is connected via USB and USB debugging is enabled

Write-Host "===== FIMS Mobile - Android Log Viewer =====" -ForegroundColor Green
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "1. USB Debugging enabled on your Android device"
Write-Host "2. Device connected via USB"
Write-Host "3. ADB (Android Debug Bridge) installed"
Write-Host ""

# Check if adb is available
$adbPath = $null
if (Test-Path "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe") {
    $adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
} elseif (Get-Command adb -ErrorAction SilentlyContinue) {
    $adbPath = "adb"
} else {
    Write-Host "ERROR: ADB not found!" -ForegroundColor Red
    Write-Host "Install Android SDK Platform Tools or add ADB to your PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Download from: https://developer.android.com/tools/releases/platform-tools" -ForegroundColor Cyan
    exit 1
}

Write-Host "Using ADB: $adbPath" -ForegroundColor Cyan

# Check if device is connected
Write-Host ""
Write-Host "Checking for connected devices..." -ForegroundColor Cyan
& $adbPath devices

Write-Host ""
Write-Host "===== Starting log stream (filtered for FIMS app) =====" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Clear previous logs
& $adbPath logcat -c

# Filter logs for our app and React Native
& $adbPath logcat `
    -s ReactNativeJS:V `
    -s ReactNative:V `
    -s Expo:V `
    -s chromium:V `
    -s System.err:V `
    -s AndroidRuntime:E `
    *:E
