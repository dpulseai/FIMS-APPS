# FIMS Mobile Application

## Overview
This is the React Native mobile application for the Field Inspection Management System (FIMS) for Zilla Parishad Chandrapur. The app allows inspectors to conduct field inspections offline with automatic sync when online.

## Features
- ✅ Email/Password Authentication
- ✅ Role-based Access Control (Inspector, Admin, Super Admin, Developer)
- ✅ Offline Form Submission
- ✅ Camera Integration with Photo Compression
- ✅ GPS Location Tracking (Google Maps API)
- ✅ Multi-language Support (English/Marathi)
- ✅ 13 Different Inspection Forms
- ✅ Auto-sync when network restored

## Project Structure

```
fims-mobile/
├── App.tsx                      # Root component
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── eas.json                     # Build configuration
└── src/
    ├── navigation/              # Navigation structure
    │   ├── RootNavigator.tsx
    │   ├── MainNavigator.tsx
    │   ├── InspectionsNavigator.tsx
    │   └── NewInspectionNavigator.tsx
    ├── screens/
    │   ├── auth/               # Authentication screens
    │   │   ├── SplashScreen.tsx
    │   │   └── LoginScreen.tsx
    │   ├── inspections/        # Inspection screens
    │   │   ├── InspectionsListScreen.tsx
    │   │   ├── InspectionDetailScreen.tsx
    │   │   └── CategorySelectionScreen.tsx
    │   ├── forms/              # 13 Inspection form screens
    │   │   ├── FIMSOfficeInspectionScreen.tsx
    │   │   ├── AnganwadiTapasaniScreen.tsx
    │   │   └── ... (11 more forms)
    │   └── ProfileScreen.tsx
    ├── components/
    │   ├── common/             # Reusable components
    │   │   ├── Card.tsx
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Stepper.tsx
    │   │   └── StatusBadge.tsx
    │   ├── InspectionCard.tsx
    │   ├── CategoryCard.tsx
    │   ├── PhotoUpload.tsx
    │   └── LocationPicker.tsx
    ├── services/
    │   ├── supabase.ts         # Supabase client
    │   ├── fimsService.ts      # FIMS API service
    │   ├── offlineService.ts   # Offline queue management
    │   ├── locationService.ts  # GPS & Google Maps
    │   └── photoService.ts     # Camera & compression
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── usePermissions.ts
    │   ├── useOfflineSync.ts
    │   └── useLocation.ts
    ├── i18n/                   # Internationalization
    │   ├── index.ts
    │   └── locales/
    │       ├── en.json
    │       └── mr.json
    └── types/
        └── index.ts
```

## Setup Instructions

### Prerequisites
1. Node.js v18 or higher
2. npm or yarn
3. Expo CLI: `npm install -g expo-cli`
4. EAS CLI: `npm install -g eas-cli`
5. Expo account (free)
6. Android Studio (for Android testing)
7. Xcode (for iOS testing - Mac only)

### Installation

```bash
cd fims-mobile
npm install
```

### Configuration

The app is already configured with:
- Supabase URL: `https://tvmqkondihsomlebizjj.supabase.co`
- Google Maps API Key: Configured in `app.json`

### Running the App

#### Development Mode
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

#### Testing on Physical Device
1. Install Expo Go app on your Android/iOS device
2. Scan the QR code from `npm start`
3. App will load on your device

## Building for Production

### Android APK

```bash
# Login to Expo account
eas login

# Configure EAS (first time only)
eas build:configure

# Build APK
eas build --profile production --platform android

# Download APK from provided link
# Install on Android device for testing
```

### iOS App

```bash
# Build for iOS
eas build --profile production --platform ios

# Note: Requires Apple Developer account ($99/year)
# For testing: Use TestFlight (included with developer account)
```

### Distribution

#### Android
1. **Internal Testing**: Share APK file directly
2. **Google Play Store**:
   - Create developer account ($25 one-time)
   - Upload APK via Google Play Console
   - Complete store listing
   - Submit for review

#### iOS
1. **TestFlight**: Internal testing (up to 100 users)
2. **App Store**:
   - Submit via App Store Connect
   - Complete app review process
   - Publish to App Store

## Inspection Forms

The app includes all 13 inspection forms from the web application:

1. **FIMSOfficeInspection** - दफ्तर निरीक्षण प्रपत्र
2. **AnganwadiTapasani** - अंगणवाडी केंद्र तपासणी
3. **HealthInspection** - आरोग्य तपासणी
4. **SubCenterMonitoring** - उपकेंद्र निरीक्षण
5. **BandhkamVibhag1** - बांधकाम विभाग 1
6. **BandhkamVibhag2** - बांधकाम विभाग 2
7. **RajyaShaishanikPrashikshan** - राज्य शैक्षणिक प्रशिक्षण
8. **RajyaGunwattaNirikshak** - राज्य गुणवत्ता निरीक्षक
9. **MumbaiNyayalay** - मुंबई न्यायालय तपासणी
10. **PahuvaidhakiyaTapasani** - पशुवैद्यकीय तपासणी
11. **MahatmaGandhiRojgarHami** - महात्मा गांधी रोजगार हमी
12. **GrampanchayatInspection** - ग्रामपंचायत तपासणी
13. **ZPDarMahinyala** - झ.प. दरमहिन्याला सादर कार्याचे प्रपत्र

## Offline Functionality

### How It Works
1. **Form Filling**: All forms can be filled offline
2. **Local Storage**: Data saved to AsyncStorage
3. **Queue System**: Submissions queued when offline
4. **Auto-Sync**: Automatic upload when connection restored
5. **Conflict Resolution**: Timestamp-based conflict handling

### Implementation
- Uses `@react-native-async-storage/async-storage`
- Network detection via `@react-native-community/netinfo`
- Queue processing in background
- Visual indicators for sync status

## Camera & Photo Features

### Specifications
- Maximum 5 photos per inspection
- Maximum file size: 5MB per photo
- Auto-compression for large images
- Date/time stamp on photos
- Works offline (stores locally)

### Implementation
- Primary: `expo-camera` for native camera
- Fallback: `expo-image-picker` for gallery
- Compression: `expo-image-manipulator`
- Format: JPEG with 80% quality

## Location Tracking

### Features
- GPS coordinates capture
- Address reverse geocoding via Google Maps API
- Location accuracy display
- Works offline (stores coordinates)
- Manual location entry fallback

### Implementation
- Uses `expo-location` for GPS
- Google Maps Geocoding API for addresses
- Accuracy threshold: 50 meters
- Fallback to last known location

## Role-Based Access Control

### Roles
- **Super Admin**: Full access to all inspections
- **Developer**: Full access (for debugging)
- **Admin**: Can only see own inspections
- **Inspector**: Can only see own inspections

### Permissions
- Fetched from `user_roles` and `application_permissions` tables
- Cached locally for offline access
- Validated on each form submission
- RLS policies enforced at database level

## Development Status

### ✅ Completed
- [x] Project setup and configuration
- [x] Supabase integration
- [x] Authentication flow
- [x] Navigation structure
- [x] i18n setup (English/Marathi)
- [x] Role-based permissions hook
- [x] Profile screen
- [x] Splash and Login screens

### 🚧 In Progress
- [ ] Inspections List screen
- [ ] Category Selection screen
- [ ] Common components (Cards, Inputs, etc.)
- [ ] Photo upload component
- [ ] Location picker component

### 📋 Pending
- [ ] All 13 inspection form screens
- [ ] Offline service implementation
- [ ] Camera service implementation
- [ ] Location service implementation
- [ ] FIMS service (API calls)
- [ ] Testing and bug fixes
- [ ] APK build and deployment

## Next Steps

### Immediate (Today)
1. Create common components (Card, Input, Button, Stepper)
2. Create InspectionsListScreen
3. Create CategorySelectionScreen
4. Create PhotoUpload component
5. Create LocationPicker component

### Short-term (1-2 days)
1. Convert all 13 forms to mobile screens
2. Implement offline service
3. Implement camera service
4. Implement location service
5. Implement FIMS service

### Final (Day 3)
1. End-to-end testing
2. Bug fixes
3. Build APK
4. Build iOS app
5. Deploy for testing

## Estimated Timeline

| Task | Time |
|------|------|
| Common components | 2 hours |
| List & Category screens | 2 hours |
| Photo & Location components | 2 hours |
| Convert 13 forms | 8-10 hours |
| Offline service | 2 hours |
| Camera service | 1 hour |
| Location service | 1 hour |
| FIMS service | 1 hour |
| Testing & fixes | 3 hours |
| Build APK/iOS | 2 hours |
| **Total** | **24-26 hours** |

## Support

For issues or questions:
- Check console logs for errors
- Verify Supabase connection
- Ensure permissions are granted
- Test on physical device (emulators may have issues with camera/GPS)

## License

© जिल्हा परिषद, चंद्रपूर
All rights reserved.
