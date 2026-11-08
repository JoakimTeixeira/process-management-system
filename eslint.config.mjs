// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
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
    files: [
      "eslint.config.mjs",
      "scripts/**/*.mjs",
      "verification/scripts/**/*.mjs",
    ],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: "module",
    },
    plugins: { sonarjs },
    rules: {
      "sonarjs/deprecation": "error",
    },
  },
  {
    files: ["playwright.config.ts", "e2e/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { sonarjs },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "sonarjs/deprecation": "error",
    },
  },
]);
