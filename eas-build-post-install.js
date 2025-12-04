#!/usr/bin/env node
/**
 * EAS Build Post-Install Hook  
 * Ensures Hermes is enabled after expo prebuild regenerates android folder
 */

const fs = require('fs');
const path = require('path');

const gradlePropertiesPath = path.join(__dirname, 'android', 'gradle.properties');

console.log('🔧 EAS Post-Install: Ensuring Hermes is enabled...');

if (fs.existsSync(gradlePropertiesPath)) {
  let content = fs.readFileSync(gradlePropertiesPath, 'utf8');
  
  // Ensure hermesEnabled is true
  if (content.includes('hermesEnabled=false')) {
    content = content.replace('hermesEnabled=false', 'hermesEnabled=true');
    fs.writeFileSync(gradlePropertiesPath, content);
    console.log('✅ Fixed: hermesEnabled=true in gradle.properties');
  } else if (content.includes('hermesEnabled=true')) {
    console.log('✅ hermesEnabled is already true');
  } else {
    // Add hermesEnabled if not present
    content += '\n# Hermes JS Engine\nhermesEnabled=true\n';
    fs.writeFileSync(gradlePropertiesPath, content);
    console.log('✅ Added hermesEnabled=true to gradle.properties');
  }
  
  // Log current state for debugging
  const lines = content.split('\n').filter(line => 
    line.includes('hermesEnabled') || line.includes('newArchEnabled')
  );
  console.log('📋 Current gradle.properties settings:');
  lines.forEach(line => console.log('   ' + line));
} else {
  console.error('❌ ERROR: gradle.properties not found at:', gradlePropertiesPath);
  process.exit(1);
}

console.log('🔧 EAS Post-Install: Complete');
