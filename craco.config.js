const path = require("path");

module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
      },
    },
  },
}; 