# 🔨 Build Instructions for FIMS Android App

## ⚠️ CRITICAL: You MUST Build a New APK

The APK you're currently testing was built **BEFORE** the Hermes fix was applied.
The error `couldn't find DSO to load: libhermes_executor.so` confirms this.

---

## ✅ Configuration is Correct

- ✅ `app.json` → `"jsEngine": "hermes"`
- ✅ `android/gradle.properties` → `hermesEnabled=true`
- ✅ Version bumped to 1.0.2 (versionCode 3)

**You just need to BUILD the app now!**

---

## 🚀 How to Build (Choose ONE Method)

### **Method 1: Using Command Prompt (Recommended)**

1. Open **Command Prompt** (NOT PowerShell)
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. Run these commands:
   ```cmd
   cd C:\Users\HP\Desktop\FIMS-APPS\FIMS-APPS
   npx eas-cli build --platform android --profile preview
   ```

3. Wait 15-20 minutes for the build to complete

4. Download the new APK from the link provided

---

### **Method 2: Using the Batch File**

Double-click: `build-android.bat`

---

### **Method 3: Enable PowerShell Scripts**

1. Open PowerShell **as Administrator**

2. Run this command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. Close and reopen regular PowerShell, then run:
   ```powershell
   cd C:\Users\HP\Desktop\FIMS-APPS\FIMS-APPS
   eas build --platform android --profile preview
   ```

---

## 📱 After Build Completes

1. **UNINSTALL** the old app from your phone completely
   - Go to Settings → Apps → FIMS Mobile → Uninstall
   
2. **Download** the new APK from EAS build link

3. **Install** the new APK on your phone

4. **Launch** and test

---

## 🎯 Expected Result

✅ App will launch successfully (no crash)
✅ Hermes engine will be used (faster, smaller)
✅ No `libjscexecutor.so` or `libhermes_executor.so` errors

---

## ❌ What Went Wrong Before

- You changed the config files locally ✅
- **BUT** you didn't rebuild the APK ❌
- The installed APK still has the OLD configuration (JSC/no Hermes)
- Android doesn't auto-update config changes - you need a new build

---

## 📞 If Build Fails

Share the error message from the build output.

---

**Remember: LOCAL config changes ≠ APK changes. You MUST rebuild!**
