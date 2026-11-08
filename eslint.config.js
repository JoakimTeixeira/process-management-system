// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const sonarjs = require("eslint-plugin-sonarjs");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    files: ["eslint.config.js"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    plugins: { sonarjs },
    rules: {
      "sonarjs/deprecation": "error",
    },
  },
  {
    files: [
      "playwright.config.ts",
      "e2e/**/*.ts",
      "scripts/**/*.ts",
      "verification/scripts/**/*.ts",
    ],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { sonarjs },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "sonarjs/deprecation": "error",
    },
  },
]);

