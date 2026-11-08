// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const sonarjs = require("eslint-plugin-sonarjs");
const globals = require("globals");

module.exports = defineConfig([
  {
    ignores: ["src/app/core/api/generated/**"],
  },
  {
    files: ["eslint.config.js"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    plugins: { sonarjs },
    rules: {
      "sonarjs/deprecation": "error",
    },
  },
  {
    files: ["scripts/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: "../../tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { sonarjs },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "sonarjs/deprecation": "error",
    },
  },
  {
    files: ["src/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { sonarjs },
    processor: angular.processInlineTemplates,
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "sonarjs/deprecation": "error",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);
