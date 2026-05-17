// @ts-nocheck
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const { sourceExts } = defaultConfig.resolver;

const config = {
  resolver: {
    // Add .mjs support for lucide-react-native and other ESM-based libraries
    sourceExts: [...sourceExts, 'mjs'],
  },
};

const customConfig = mergeConfig(defaultConfig, config);

module.exports = withUniwindConfig(customConfig, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
