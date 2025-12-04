#!/usr/bin/env node
/**
 * EAS Build Pre-Install Hook
 * Ensures Hermes is enabled in gradle.properties before build
 */

const fs = require('fs');
const path = require('path');

const gradlePropertiesPath = path.join(__dirname, 'android', 'gradle.properties');

console.log('🔧 EAS Pre-Install: Checking Hermes configuration...');

if (fs.existsSync(gradlePropertiesPath)) {
  let content = fs.readFileSync(gradlePropertiesPath, 'utf8');
  
  // Ensure hermesEnabled is true
  if (content.includes('hermesEnabled=false')) {
    content = content.replace('hermesEnabled=false', 'hermesEnabled=true');
    fs.writeFileSync(gradlePropertiesPath, content);
    console.log('✅ Updated hermesEnabled=true in gradle.properties');
  } else if (content.includes('hermesEnabled=true')) {
    console.log('✅ hermesEnabled is already set to true');
  } else {
    // Add hermesEnabled if not present
    content += '\n# Hermes JS Engine\nhermesEnabled=true\n';
    fs.writeFileSync(gradlePropertiesPath, content);
    console.log('✅ Added hermesEnabled=true to gradle.properties');
  }
} else {
  console.log('⚠️ gradle.properties not found, will be created during prebuild');
}

console.log('🔧 EAS Pre-Install: Configuration check complete');
