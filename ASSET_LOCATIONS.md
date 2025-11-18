# 📁 Quick Reference: Asset Locations

## 🎯 Mobile App Assets

### **Main Location:**
```
/tmp/cc-agent/56810241/project/fims-mobile/assets/
```

### **Sub-folders:**

```
fims-mobile/
└── assets/
    ├── images/          ← Put images here (.png, .jpg, .jpeg, .gif)
    ├── icons/           ← Put icons here (.png)
    ├── fonts/           ← Put fonts here (.ttf, .otf)
    ├── icon.png         ← App icon (1024x1024)
    └── splash.png       ← Splash screen (1242x2436)
```

---

## 💻 Web App Assets

### **Main Location:**
```
/tmp/cc-agent/56810241/project/public/
```

### **Current Files:**
```
public/
├── logo.png
├── site.png
├── image.png
├── Zpchandrapurlogo.png
├── website_background_collage.jpg
└── [add your files here]
```

---

## 🚀 Quick Commands

### **Mobile App:**

```bash
# Navigate to mobile assets
cd /tmp/cc-agent/56810241/project/fims-mobile/assets

# Copy image
cp /your/image.png images/

# Copy icon
cp /your/icon.png icons/

# Copy font
cp /your/font.ttf fonts/

# List all images
ls -lh images/
```

### **Web App:**

```bash
# Navigate to web assets
cd /tmp/cc-agent/56810241/project/public

# Copy file
cp /your/file.png .

# List all files
ls -lh
```

---

## 📝 Usage Examples

### **Mobile - Use Image:**
```typescript
import { Image } from 'react-native';

<Image
  source={require('../assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>
```

### **Mobile - Use Icon:**
```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="camera" size={24} color="black" />
```

### **Web - Use Image:**
```typescript
<img src="/logo.png" alt="Logo" />
```

---

## ✅ Summary

| Type | Mobile Path | Web Path |
|------|-------------|----------|
| **Images** | `fims-mobile/assets/images/` | `public/` |
| **Icons** | `fims-mobile/assets/icons/` | `public/` |
| **Fonts** | `fims-mobile/assets/fonts/` | `public/fonts/` |

**That's it! Simple and organized.** 🎉
