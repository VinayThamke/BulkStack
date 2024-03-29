// webpack.config.js

module.exports = {
  // ... other configuration options

  module: {
    rules: [
      // ... other rules

      // Add a rule for worker files
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      },
    ],
  },
};
