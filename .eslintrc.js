/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./apps/*/tsconfig.json",
      "./packages/*/tsconfig.json",
      "./workers/*/tsconfig.json",
      "./services/*/tsconfig.json",
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/app", "apps/web"],
    },
  },
  ignorePatterns: ["node_modules", "dist", "**/*.config.js", ".next"],
};
