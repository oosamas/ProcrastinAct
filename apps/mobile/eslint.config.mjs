import { config } from "@procrastinact/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // Ignore CommonJS config files used by Metro/Expo
    ignores: ['metro.config.js', 'empty-module.js'],
  },
];
