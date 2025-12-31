// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch workspace packages (but not the root to avoid confusion with root app.json)
config.watchFolders = [path.resolve(workspaceRoot, 'packages')];

// Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Prevent Metro from looking at root-level files
config.resolver.disableHierarchicalLookup = true;

// Stub out Node.js-only packages that aren't compatible with React Native
// These packages are imported by @procrastinact/core but aren't needed for mobile
const emptyModule = require.resolve('./empty-module.js');

// List of modules to stub out
const stubbedModules = [
  // AI SDK packages (Node.js only)
  'ai',
  '@ai-sdk/anthropic',
  '@ai-sdk/openai',
  '@ai-sdk/gateway',
  '@ai-sdk/provider',
  '@ai-sdk/provider-utils',
  '@vercel/oidc',
  // Zod v4 import paths
  'zod/v4',
  'zod/v4/core',
];

// Node.js built-ins
const nodeBuiltins = [
  'crypto',
  'stream',
  'http',
  'https',
  'zlib',
  'fs',
  'path',
  'os',
];

// Set up extra node modules for stubbing
config.resolver.extraNodeModules = {};
[...stubbedModules, ...nodeBuiltins].forEach((mod) => {
  config.resolver.extraNodeModules[mod] = emptyModule;
});

// Use resolveRequest to intercept module resolution before Metro tries to find the package
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if this is a stubbed module or starts with one
  for (const stubbed of stubbedModules) {
    if (moduleName === stubbed || moduleName.startsWith(stubbed + '/')) {
      return {
        filePath: emptyModule,
        type: 'sourceFile',
      };
    }
  }

  // Check node builtins
  if (nodeBuiltins.includes(moduleName)) {
    return {
      filePath: emptyModule,
      type: 'sourceFile',
    };
  }

  // Use default resolution
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  // Fallback to context resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
