const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Inline requires: defers module execution until first use.
// Significantly reduces JS parse time on startup (lazy loading of all screens/components).
config.transformer = {
  ...config.transformer,
  inlineRequires: true,
};

// Minify identifiers in production for smaller bundle
config.serializer = {
  ...config.serializer,
};

module.exports = config;
