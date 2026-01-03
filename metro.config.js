// Learn more https://docs.expo.io/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure resolver lists exist and use explicit variables (more resilient across versions)
const assetExts = config.resolver?.assetExts ?? [];
const sourceExts = config.resolver?.sourceExts ?? [];

// Add SVG transformer support
config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer'
);

// Remove svg from asset extensions and add to source extensions
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

module.exports = config;
