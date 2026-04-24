// @ts-nocheck
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

const customConfig = mergeConfig(getDefaultConfig(__dirname), config);

module.exports = withUniwindConfig(customConfig, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts'
});
