const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add .cjs extension support for Firebase modules
defaultConfig.resolver.sourceExts.push('cjs');

// Disable unstable package exports that can cause issues with Firebase
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;


