# 📁 FIMS Mobile - Assets Folder Guide

## 📂 Assets Folder Location

### **Mobile App Assets:**
```
/tmp/cc-agent/56810241/project/fims-mobile/assets/
```

### **Folder Structure:**
```
fims-mobile/
├── assets/
│   ├── images/          ← Put all images here
│   ├── icons/           ← Put all icons here
│   └── fonts/           ← Put all custom fonts here
├── src/
└── App.tsx
```

---

## 🖼️ How to Add Images

### **Step 1: Add Image Files**

Copy your images to the assets folder:
```bash
cp /path/to/your/logo.png /tmp/cc-agent/56810241/project/fims-mobile/assets/images/
cp /path/to/your/banner.jpg /tmp/cc-agent/56810241/project/fims-mobile/assets/images/
```

### **Step 2: Use in Your App**

**Method 1: Static Image (Recommended)**
```typescript
import { Image } from 'react-native';

<Image
  source={require('../assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>
```

**Method 2: Dynamic Image**
```typescript
import { Image } from 'react-native';

const images = {
  logo: require('../assets/images/logo.png'),
  banner: require('../assets/images/banner.jpg'),
};

<Image
  source={images.logo}
  style={{ width: 100, height: 100 }}
/>
```

---

## 🎨 How to Add Icons

### **Step 1: Add Icon Files**

```bash
cp /path/to/your/icon.png /tmp/cc-agent/56810241/project/fims-mobile/assets/icons/
```

### **Step 2: Use in Your App**

```typescript
import { Image } from 'react-native';

<Image
  source={require('../assets/icons/icon.png')}
  style={{ width: 24, height: 24 }}
/>
```

**OR use Expo's built-in icons (Already Available):**
```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="camera" size={24} color="black" />
```

Available icon sets:
- `Ionicons` (5000+ icons)
- `MaterialIcons`
- `FontAwesome`
- `Feather`
- `AntDesign`

---

## 🔤 How to Add Custom Fonts

### **Step 1: Add Font Files**

```bash
cp /path/to/your/CustomFont-Regular.ttf /tmp/cc-agent/56810241/project/fims-mobile/assets/fonts/
cp /path/to/your/CustomFont-Bold.ttf /tmp/cc-agent/56810241/project/fims-mobile/assets/fonts/
```

### **Step 2: Load Fonts in App.tsx**

```typescript
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
        'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // or loading screen
  }

  return <YourApp />;
}
```

### **Step 3: Use in Components**

```typescript
import { Text } from 'react-native';

<Text style={{ fontFamily: 'CustomFont-Regular' }}>
  Hello World
</Text>
```

---

## 📱 App Icon & Splash Screen

### **App Icon Location:**
```
/tmp/cc-agent/56810241/project/fims-mobile/assets/icon.png
```

**Requirements:**
- Size: 1024x1024 px
- Format: PNG
- Square image

**Add your app icon:**
```bash
cp /path/to/your/app-icon.png /tmp/cc-agent/56810241/project/fims-mobile/assets/icon.png
```

### **Splash Screen Location:**
```
/tmp/cc-agent/56810241/project/fims-mobile/assets/splash.png
```

**Requirements:**
- Size: 1242x2436 px (iPhone X resolution)
- Format: PNG
- Will be resized for different devices

**Add your splash screen:**
```bash
cp /path/to/your/splash.png /tmp/cc-agent/56810241/project/fims-mobile/assets/splash.png
```

### **Configure in app.json:**
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

---

## 🌐 Web App Assets (Separate)

### **Web Assets Location:**
```
/tmp/cc-agent/56810241/project/public/
```

**Folder Structure:**
```
project/
├── public/
│   ├── logo.png            ← Already exists
│   ├── site.png            ← Already exists
│   ├── image.png           ← Already exists
│   └── your-file.jpg       ← Add here
└── src/
```

**Use in Web App:**
```typescript
<img src="/logo.png" alt="Logo" />
```

---

## 📋 Supported File Formats

### **Images:**
- ✅ PNG (recommended for icons/logos)
- ✅ JPG/JPEG (recommended for photos)
- ✅ GIF (animated images)
- ✅ WebP (modern format)
- ✅ SVG (use react-native-svg package)

### **Fonts:**
- ✅ TTF (TrueType Font)
- ✅ OTF (OpenType Font)

### **Audio/Video:**
- ✅ MP3, WAV (audio)
- ✅ MP4, MOV (video)

---

## 🎯 Best Practices

### **1. Image Optimization**
```bash
# Optimize images before adding
# Use tools like:
# - TinyPNG (https://tinypng.com/)
# - ImageOptim (Mac)
# - GIMP (Free)

# Keep images under 500KB each
# Use appropriate resolution (not too high)
```

### **2. Naming Convention**
```
✅ Good:
- logo.png
- user-avatar.png
- home-banner.jpg
- icon-camera.png

❌ Bad:
- Logo.PNG
- IMG_1234.jpg
- image (1).png
- my file.jpg (no spaces!)
```

### **3. Organize by Purpose**
```
assets/
├── images/
│   ├── logos/
│   ├── backgrounds/
│   └── photos/
├── icons/
│   ├── navigation/
│   └── actions/
└── fonts/
```

### **4. Multiple Resolutions (Optional)**
```
images/
├── logo.png           (1x - base resolution)
├── logo@2x.png        (2x - retina)
└── logo@3x.png        (3x - high-res)
```

React Native automatically picks the right one!

---

## 🔧 Common Commands

### **Copy files to mobile assets:**
```bash
# Copy image
cp /source/image.png /tmp/cc-agent/56810241/project/fims-mobile/assets/images/

# Copy icon
cp /source/icon.png /tmp/cc-agent/56810241/project/fims-mobile/assets/icons/

# Copy font
cp /source/font.ttf /tmp/cc-agent/56810241/project/fims-mobile/assets/fonts/

# Copy multiple files
cp /source/*.png /tmp/cc-agent/56810241/project/fims-mobile/assets/images/
```

### **Copy files to web public folder:**
```bash
cp /source/image.png /tmp/cc-agent/56810241/project/public/
```

### **List all assets:**
```bash
# Mobile assets
ls -lh /tmp/cc-agent/56810241/project/fims-mobile/assets/images/

# Web assets
ls -lh /tmp/cc-agent/56810241/project/public/
```

---

## 📦 Example: Adding Logo

### **Step-by-Step:**

**1. Copy logo to assets:**
```bash
cp /path/to/fims-logo.png /tmp/cc-agent/56810241/project/fims-mobile/assets/images/logo.png
```

**2. Create component:**
```typescript
// src/components/Logo.tsx
import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
});
```

**3. Use in your screen:**
```typescript
import Logo from '../components/Logo';

<Logo />
```

---

## 🎨 Example: Using Icons

### **Built-in Icons (Recommended):**
```typescript
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

// Camera icon
<Ionicons name="camera" size={24} color="black" />

// Home icon
<MaterialIcons name="home" size={24} color="blue" />

// User icon
<FontAwesome name="user" size={24} color="green" />
```

**Browse all icons:** https://icons.expo.fyi/

### **Custom Icons:**
```typescript
import { Image } from 'react-native';

<Image
  source={require('../assets/icons/custom-icon.png')}
  style={{ width: 24, height: 24 }}
/>
```

---

## ✅ Quick Reference

| Asset Type | Mobile Location | Web Location | Usage |
|------------|----------------|--------------|-------|
| **Images** | `fims-mobile/assets/images/` | `project/public/` | Photos, backgrounds, banners |
| **Icons** | `fims-mobile/assets/icons/` | `project/public/` | Small graphics, UI elements |
| **Fonts** | `fims-mobile/assets/fonts/` | `project/public/fonts/` | Custom typography |
| **App Icon** | `fims-mobile/assets/icon.png` | `project/public/icon.png` | App launcher icon |
| **Splash** | `fims-mobile/assets/splash.png` | N/A | App loading screen |

---

## 🚀 Ready to Use!

Your assets folders are ready:

**Mobile App:**
```
✅ /tmp/cc-agent/56810241/project/fims-mobile/assets/images/
✅ /tmp/cc-agent/56810241/project/fims-mobile/assets/icons/
✅ /tmp/cc-agent/56810241/project/fims-mobile/assets/fonts/
```

**Web App:**
```
✅ /tmp/cc-agent/56810241/project/public/
```

**Start adding your assets and use them in your app!**

---

## 📚 Additional Resources

- **Expo Assets:** https://docs.expo.dev/develop/user-interface/assets/
- **React Native Images:** https://reactnative.dev/docs/images
- **Expo Icons:** https://icons.expo.fyi/
- **Image Optimization:** https://tinypng.com/

---

**Need help?** Just ask! 🎉
