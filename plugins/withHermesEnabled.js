const { withGradleProperties } = require('expo/config-plugins');

/**
 * Expo Config Plugin to ensure Hermes is enabled
 * This runs during prebuild and ensures gradle.properties has hermesEnabled=true
 */
const withHermesEnabled = (config) => {
  return withGradleProperties(config, (config) => {
    // Find and update hermesEnabled property
    const hermesProperty = config.modResults.find(
      (item) => item.type === 'property' && item.key === 'hermesEnabled'
    );

    if (hermesProperty) {
      hermesProperty.value = 'true';
      console.log('✅ Config Plugin: Set hermesEnabled=true');
    } else {
      // Add the property if it doesn't exist
      config.modResults.push({
        type: 'property',
        key: 'hermesEnabled',
        value: 'true',
      });
      console.log('✅ Config Plugin: Added hermesEnabled=true');
    }

    return config;
  });
};

module.exports = withHermesEnabled;
