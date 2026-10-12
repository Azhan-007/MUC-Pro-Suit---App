const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Only watch the mobile project and shared packages (do not watch admin-web or backend)
config.watchFolders = [
  projectRoot,
  path.resolve(monorepoRoot, 'packages'),
];

// 2. Block Metro from traversing other apps in the monorepo
config.resolver.blockList = [
  /.*[/\\]apps[/\\]admin-web[/\\].*/,
  /.*[/\\]apps[/\\]backend[/\\].*/,
];

// 3. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;

