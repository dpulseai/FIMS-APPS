# How to View Android App Crash Logs

## Method 1: Using ADB (Recommended)

### Prerequisites
1. **Enable USB Debugging on your Android device:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Install Android SDK Platform Tools** (if not already installed):
   - Download from: https://developer.android.com/tools/releases/platform-tools
   - Extract and add to PATH, or note the location

3. **Connect your device via USB**

### View Live Logs

**Option A: Using PowerShell script (Easiest)**
```powershell
cd C:\Users\HP\Desktop\FIMS-APPS\FIMS-APPS
.\scripts\view-android-logs.ps1
```

**Option B: Manual ADB command**
```powershell
# Replace with your ADB path if needed
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe logcat -s ReactNativeJS:V ReactNative:V Expo:V *:E
```

### Steps to Capture Crash
1. Clear old logs: `adb logcat -c`
2. Start logging: `adb logcat > crash-log.txt`
3. Launch the app on your device
4. Wait for the crash
5. Press Ctrl+C to stop logging
6. Open `crash-log.txt` and search for:
   - "FATAL EXCEPTION"
   - "AndroidRuntime"
   - "Error"
   - "[App]" (our custom logs)
   - "[Supabase]" (our custom logs)
   - "[i18n]" (our custom logs)
   - "[useAuth]" (our custom logs)

## Method 2: Using Chrome DevTools (Alternative)

1. Connect device via USB
2. Enable USB Debugging
3. Open Chrome browser on your PC
4. Navigate to: `chrome://inspect`
5. Find your device and app
6. Click "Inspect" to open DevTools
7. Go to Console tab to see logs
8. Launch app and watch for errors

## Method 3: React Native Debugger (If available)

1. Install React Native Debugger
2. Connect device
3. Shake device to open Debug Menu
4. Select "Debug" or "Show Dev Menu"
5. View logs in debugger console

## What to Look For

The new logging will show detailed output with prefixes:

```
[App] Starting initialization...
[i18n] Starting initialization...
[i18n] Detecting language from AsyncStorage...
[i18n] Detected language: en (default)
[i18n] Initialization complete
[Supabase] Initializing client...
[Supabase] Creating client with URL: https://...
[Supabase] Client created successfully
[useAuth] Mounting and initializing auth...
[useAuth] Getting session...
[useAuth] Session retrieved: No session
[useAuth] Auth state updated - loading complete
[RootNavigator] Auth state - loading: false user: not logged in
```

## Common Issues and What Logs Show

### Issue 1: AsyncStorage Permission Error
**Log Pattern:**
```
[i18n] Error detecting language: Permission denied
[Supabase] Failed to create client: AsyncStorage error
```
**Solution:** Check storage permissions in AndroidManifest.xml

### Issue 2: i18n Initialization Timeout
**Log Pattern:**
```
[App] i18n initialization timeout, proceeding anyway
```
**Solution:** AsyncStorage is slow or blocked

### Issue 3: Supabase Client Creation Failed
**Log Pattern:**
```
[Supabase] Failed to create client: [error details]
[Supabase] Configuration error - app may not function correctly
```
**Solution:** Check network permissions or AsyncStorage

### Issue 4: Auth Timeout
**Log Pattern:**
```
[useAuth] Session timeout after 5 seconds
[useAuth] Auth state cleared due to error
```
**Solution:** Network connectivity or Supabase configuration issue

## Send Logs for Support

After capturing the crash:
1. Find the error section in the logs
2. Copy 50-100 lines around the error
3. Include all lines with [App], [Supabase], [i18n], [useAuth] prefixes
4. Share with development team
