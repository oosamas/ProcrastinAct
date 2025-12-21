// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub out Node.js-only packages that aren't compatible with React Native
// These packages are imported by @procrastinact/core but aren't needed for mobile
const emptyModule = require.resolve('./empty-module.js');

config.resolver.extraNodeModules = {
  // AI SDK packages (Node.js only)
  ai: emptyModule,
  '@ai-sdk/anthropic': emptyModule,
  '@ai-sdk/openai': emptyModule,
  // Node.js built-ins that might be referenced
  crypto: emptyModule,
  stream: emptyModule,
  http: emptyModule,
  https: emptyModule,
  zlib: emptyModule,
};

module.exports = config;
