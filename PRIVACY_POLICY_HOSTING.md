# Hosting Privacy Policy for Google Play

## Problem
Google Play requires a publicly accessible Privacy Policy URL. You have the privacy policy HTML file but it needs to be hosted online.

## Solution Options

### Option 1: GitHub Pages (Recommended - Free)

1. **Create a new public repository** (or use existing one):
   - Go to https://github.com/dpulseai
   - Create a new repository named `fims-privacy-policy` or use existing FIMS-APPS repo

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main (or master) → /root
   - Save

3. **Upload privacy-policy.html**:
   ```powershell
   # Create a simple index.html that is the privacy policy
   cd FIMS-APPS
   git checkout -b gh-pages
   git add privacy-policy.html
   git commit -m "Add privacy policy for GitHub Pages"
   git push origin gh-pages
   ```

4. **Your Privacy Policy URL will be**:
   ```
   https://dpulseai.github.io/FIMS-APPS/privacy-policy.html
   ```

### Option 2: Netlify (Alternative - Also Free)

1. Go to https://www.netlify.com/
2. Sign up with GitHub
3. Drag and drop the `privacy-policy.html` file
4. Get a URL like: `https://fims-privacy.netlify.app/privacy-policy.html`

### Option 3: Google Sites (Simple)

1. Go to https://sites.google.com/
2. Create a new site
3. Copy-paste the content from privacy-policy.html
4. Publish and get a URL

### Option 4: Your Organization's Website

If Zilla Parishad Chandrapur has an official website, host it there:
```
https://zpchandrapur.gov.in/fims-privacy-policy.html
```

## Quick Setup - GitHub Pages (5 minutes)

I'll create a simple setup for you:

### Step 1: Create a minimal deployment
```powershell
cd FIMS-APPS\FIMS-APPS
git checkout main
# Rename privacy-policy.html to index.html for GitHub Pages
copy privacy-policy.html index.html
```

### Step 2: Push to a gh-pages branch
```powershell
git checkout -b gh-pages
git add index.html privacy-policy.html
git commit -m "Add privacy policy for GitHub Pages"
git push origin gh-pages
```

### Step 3: Enable GitHub Pages
1. Go to: https://github.com/dpulseai/FIMS-APPS/settings/pages
2. Source: gh-pages branch
3. Save

### Step 4: Get your URL
Your privacy policy will be available at:
```
https://dpulseai.github.io/FIMS-APPS/privacy-policy.html
```

### Step 5: Add to Google Play Console
1. Go to Google Play Console
2. Navigate to: App content → Privacy policy
3. Enter the URL: `https://dpulseai.github.io/FIMS-APPS/privacy-policy.html`
4. Save

## Update app.json (Optional)

You can also add the privacy policy URL to your app.json:

```json
{
  "expo": {
    "privacyPolicy": "https://dpulseai.github.io/FIMS-APPS/privacy-policy.html"
  }
}
```

## Verification

After hosting, verify the privacy policy is accessible:
1. Open the URL in a browser
2. Ensure it loads correctly
3. The page should display your complete privacy policy

## Important Note

Make sure the repository is **public** for GitHub Pages to work, or use Netlify/other hosting if you want to keep the repo private.
