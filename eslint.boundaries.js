import boundaries from "eslint-plugin-boundaries";

export const eslintBoundariesConfig = {
  plugins: {
    boundaries,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },

    "boundaries/elements": [
      {
        type: "app",
        pattern: "./src/app",
      },
      {
        type: "pages",
        pattern: "./src/pages",
      },
      {
        type: "features",
        pattern: "./src/features/*",
      },
      {
        type: "shared",
        pattern: "./src/shared",
      },
    ],
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "allow",
        rules: [
          {
            from: "shared",
            disallow: ["app", "features", "pages"],
            message:
              "Lower layer module (${file.type}) cannot import upper layer module (${dependency.type})",
          },
          {
            from: "features",
            disallow: ["app", "pages"],
            message:
              "Lower layer module (${file.type}) cannot import upper layer module (${dependency.type})",
          },
          {
            from: "pages",
            disallow: ["app"],
            message:
              "Lower layer module (${file.type}) cannot import upper layer module (${dependency.type})",
          },
        ],
      },
    ],
    "boundaries/entry-point": [
      2,
      {
        default: "disallow",
        message:
          "Module (${file.type}) must be imported through public API. Direct import from ${dependency.source} is not allowed",

        rules: [
          {
            target: ["shared", "app"],
            allow: "**",
          },
          {
            target: ["features"],
            allow: ["index.(ts|tsx)"],
          },
          {
            target: ["pages"],
            allow: ["*.page.tsx"],
          },
        ],
      },
    ],
  },
};