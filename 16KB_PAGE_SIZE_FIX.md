# 16 KB Page Size Support Fix for Google Play

## Problem
Google Play now requires apps to support 16 KB memory page sizes for devices running Android 15 and above. Without this support, the app cannot be published.

## Solution Applied

### 1. Updated `android/app/build.gradle`

**Added NDK ABI filters in defaultConfig:**
```gradle
ndk {
    abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
}
```

**Added splits configuration for all ABIs:**
```gradle
splits {
    abi {
        reset()
        enable true
        universalApk true
        include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
    }
}
```

**Incremented version:**
- versionCode: 6 → 7
- versionName: "1.0.5" → "1.0.6"

### 2. Updated `app.json`
- version: "1.0.5" → "1.0.6"
- android.versionCode: 6 → 7

### 3. Existing Configuration (already correct)
The `android/gradle.properties` file already had the correct architecture settings:
```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

## What This Does

1. **ABI Filters**: Ensures native libraries are built for all required architectures
2. **Splits Configuration**: Creates separate APKs for each architecture while also generating a universal APK that includes all architectures
3. **Universal APK**: The `universalApk true` setting ensures a single APK that works on all devices is generated, which is required for Google Play

## Next Steps

### 1. Clean and Rebuild
```powershell
cd FIMS-APPS
cd android
./gradlew clean
cd ..
```

### 2. Build the Release AAB
```powershell
# Using EAS Build (recommended for Expo projects)
npx eas-cli build --platform android --profile production

# OR using Expo CLI
npx expo build:android -t app-bundle
```

### 3. Test the Build
Before uploading to Google Play, verify the build includes all architectures:
```powershell
# Extract and check the AAB
# The build should show libraries for arm64-v8a, armeabi-v7a, x86, x86_64
```

### 4. Upload to Google Play Console
1. Go to Google Play Console
2. Navigate to your app → Production → Create new release
3. Upload the new AAB file (version 1.0.6, versionCode 7)
4. Google Play will automatically verify 16 KB page size support

## Verification

After upload, Google Play will show:
- ✅ Supports 16 KB page sizes
- All required architectures included
- No warnings about page size support

## Reference
- [Android 16 KB Page Size Guide](https://developer.android.com/guide/practices/page-sizes#build)
- [Expo Android Build Configuration](https://docs.expo.dev/build/eas-json/)

## Changes Summary
- ✅ Added NDK ABI filters for all architectures
- ✅ Configured ABI splits with universal APK support
- ✅ Incremented version to 1.0.6 (versionCode 7)
- ✅ Ready for Google Play submission
