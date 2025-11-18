#!/bin/bash

echo "🧹 Cleaning FIMS Mobile App..."
echo ""

# Navigate to project directory
cd /tmp/cc-agent/56810241/project/fims-mobile

# Remove all cache and build folders
echo "📦 Removing node_modules..."
rm -rf node_modules

echo "📦 Removing .expo cache..."
rm -rf .expo

echo "📦 Removing package-lock.json..."
rm -rf package-lock.json

echo "📦 Removing metro cache..."
rm -rf .metro

echo "📦 Cleaning npm cache..."
npm cache clean --force

echo ""
echo "✅ Cleanup complete!"
echo ""

echo "📥 Installing dependencies (without reanimated)..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""

echo "🚀 Starting Expo with clean cache..."
echo ""
npx expo start --clear
