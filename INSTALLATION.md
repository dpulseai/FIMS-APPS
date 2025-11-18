# FIMS Mobile - Installation & Build Guide

## Current Status

### ✅ What's Been Created

1. **Project Structure**: Complete folder structure set up
2. **Configuration Files**:
   - `package.json` with all dependencies
   - `app.json` with Expo configuration
   - `tsconfig.json` for TypeScript
   - `eas.json` for build configuration
   - `.env` with Supabase credentials

3. **Core Services**:
   - Supabase client (`src/services/supabase.ts`)
   - Auth hook (`src/hooks/useAuth.ts`)
   - Permissions hook (`src/hooks/usePermissions.ts`)

4. **Navigation**:
   - Root Navigator
   - Main Navigator with Bottom Tabs
   - Inspections Navigator
   - New Inspection Navigator

5. **Screens**:
   - Splash Screen
   - Login Screen
   - Profile Screen

6. **i18n**: English and Marathi translations

## Installation Steps

### Step 1: Navigate to Project

```bash
cd /tmp/cc-agent/56810241/project/fims-mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Expo SDK (~51.0.0)
- React Native
- React Navigation
- Supabase client
- React Native Paper (UI components)
- Camera, Location, Maps
- i18next for translations
- AsyncStorage for offline
- NetInfo for connectivity

### Step 3: Install Expo CLI (if not installed)

```bash
npm install -g expo-cli eas-cli
```

### Step 4: Start Development Server

```bash
npx expo start
```

This will:
1. Start Metro bundler
2. Show QR code for testing
3. Open development menu

### Step 5: Test on Device

#### Option A: Expo Go App (Recommended for testing)
1. Install "Expo Go" from Play Store/App Store
2. Scan QR code from terminal
3. App will load on your device

#### Option B: Android Emulator
```bash
npx expo run:android
```

#### Option C: iOS Simulator (Mac only)
```bash
npx expo run:ios
```

## What Still Needs to Be Created

### Immediate Priority (2-3 hours)

1. **Common Components** (`src/components/common/`)
   - `Card.tsx` - Reusable card component
   - `Button.tsx` - Custom button
   - `Input.tsx` - Form input field
   - `Stepper.tsx` - Multi-step progress indicator
   - `StatusBadge.tsx` - Status chips
   - `LoadingSpinner.tsx` - Loading indicator

2. **Inspection Components** (`src/components/`)
   - `InspectionCard.tsx` - Card for inspection list
   - `CategoryCard.tsx` - Card for category selection
   - `PhotoUpload.tsx` - Photo capture/upload component
   - `LocationPicker.tsx` - GPS location picker

3. **Key Screens** (`src/screens/inspections/`)
   - `InspectionsListScreen.tsx` - List of all inspections
   - `InspectionDetailScreen.tsx` - View inspection details
   - `CategorySelectionScreen.tsx` - Select inspection category

### Next Priority (8-10 hours)

4. **Services** (`src/services/`)
   - `fimsService.ts` - API calls for inspections
   - `offlineService.ts` - Offline queue management
   - `locationService.ts` - GPS & Google Maps
   - `photoService.ts` - Camera & photo compression

5. **Hooks** (`src/hooks/`)
   - `useOfflineSync.ts` - Auto-sync when online
   - `useLocation.ts` - Location tracking

6. **All 13 Form Screens** (`src/screens/forms/`)
   - FIMSOfficeInspectionScreen.tsx
   - AnganwadiTapasaniScreen.tsx
   - HealthInspectionScreen.tsx
   - SubCenterMonitoringScreen.tsx
   - BandhkamVibhag1Screen.tsx
   - BandhkamVibhag2Screen.tsx
   - RajyaShaishanikPrashikshanScreen.tsx
   - RajyaGunwattaNirikshakScreen.tsx
   - MumbaiNyayalayScreen.tsx
   - PahuvaidhakiyaTapasaniScreen.tsx
   - MahatmaGandhiRojgarHamiScreen.tsx
   - GrampanchayatInspectionScreen.tsx
   - ZPDarMahinyalaScreen.tsx

### Final Priority (2-3 hours)

7. **Testing & Bug Fixes**
   - Test all forms
   - Test offline mode
   - Test camera
   - Test location
   - Fix any issues

8. **Build & Deploy**
   - Build APK
   - Build iOS app
   - Test installations

## Building for Production

### Android APK

#### Step 1: Login to Expo

```bash
eas login
```

Create free account at https://expo.dev if you don't have one.

#### Step 2: Configure EAS (First time only)

```bash
eas build:configure
```

This creates `eas.json` (already done).

#### Step 3: Build APK

```bash
# For testing (faster)
eas build --profile preview --platform android

# For production
eas build --profile production --platform android
```

#### Step 4: Download and Install

1. Build will take 10-15 minutes
2. You'll get a download link
3. Download APK file
4. Transfer to Android device
5. Install APK (may need to enable "Install from Unknown Sources")

### iOS App

```bash
eas build --profile production --platform ios
```

**Note**: iOS builds require:
- Apple Developer account ($99/year)
- Or use TestFlight for testing (included with developer account)

## Quick Commands Reference

```bash
# Development
npm start                    # Start dev server
npm run android             # Run on Android
npm run ios                 # Run on iOS

# Building
eas build --platform android --profile preview    # Android APK (test)
eas build --platform android --profile production # Android APK (production)
eas build --platform ios --profile production     # iOS IPA

# Debugging
npx expo start --clear      # Clear cache and start
npx react-native log-ios    # iOS logs
npx react-native log-android # Android logs
```

## Common Issues & Solutions

### Issue 1: Metro Bundler Errors
```bash
# Clear cache
npx expo start --clear
rm -rf node_modules
npm install
```

### Issue 2: Can't connect to dev server
- Ensure phone and computer on same WiFi
- Try using Tunnel mode: `npx expo start --tunnel`

### Issue 3: Camera/Location not working
- Grant permissions in device settings
- Test on physical device (emulators may not work)

### Issue 4: Build fails
```bash
# Check EAS credentials
eas credentials

# Clear build cache
eas build --clear-cache --platform android
```

## File Completion Checklist

### ✅ Completed Files
- [x] package.json
- [x] app.json
- [x] tsconfig.json
- [x] babel.config.js
- [x] eas.json
- [x] .env
- [x] App.tsx
- [x] src/services/supabase.ts
- [x] src/types/index.ts
- [x] src/hooks/useAuth.ts
- [x] src/hooks/usePermissions.ts
- [x] src/i18n/index.ts
- [x] src/i18n/locales/en.json
- [x] src/i18n/locales/mr.json
- [x] src/navigation/RootNavigator.tsx
- [x] src/navigation/MainNavigator.tsx
- [x] src/navigation/InspectionsNavigator.tsx
- [x] src/navigation/NewInspectionNavigator.tsx
- [x] src/screens/auth/SplashScreen.tsx
- [x] src/screens/auth/LoginScreen.tsx
- [x] src/screens/ProfileScreen.tsx

### ⏳ Pending Files (23 files)
- [ ] src/components/common/Card.tsx
- [ ] src/components/common/Button.tsx
- [ ] src/components/common/Input.tsx
- [ ] src/components/common/Stepper.tsx
- [ ] src/components/common/StatusBadge.tsx
- [ ] src/components/common/LoadingSpinner.tsx
- [ ] src/components/InspectionCard.tsx
- [ ] src/components/CategoryCard.tsx
- [ ] src/components/PhotoUpload.tsx
- [ ] src/components/LocationPicker.tsx
- [ ] src/screens/inspections/InspectionsListScreen.tsx
- [ ] src/screens/inspections/InspectionDetailScreen.tsx
- [ ] src/screens/inspections/CategorySelectionScreen.tsx
- [ ] src/services/fimsService.ts
- [ ] src/services/offlineService.ts
- [ ] src/services/locationService.ts
- [ ] src/services/photoService.ts
- [ ] src/hooks/useOfflineSync.ts
- [ ] src/hooks/useLocation.ts
- [ ] + 13 form screen files

## Timeline Estimate

Based on remaining work:

- **Day 1 (8-10 hours)**:
  - Components + Key screens + Services (6 hours)
  - 4-5 form screens (4 hours)

- **Day 2 (8-10 hours)**:
  - Remaining 8-9 form screens (8 hours)
  - Testing (2 hours)

- **Day 3 (4-6 hours)**:
  - Bug fixes (2 hours)
  - Build APK (1 hour)
  - Build iOS (1 hour)
  - Testing installations (2 hours)

**Total: 20-26 hours** across 3 days

## Next Command to Run

```bash
cd /tmp/cc-agent/56810241/project/fims-mobile
npm install
npx expo start
```

Then test the app on your phone using Expo Go!

## Support

If you encounter any issues:
1. Check error messages in terminal
2. Check device console logs
3. Verify all dependencies installed
4. Try clearing cache: `npx expo start --clear`
5. Ensure Supabase credentials are correct
