// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const sonarjs = require('eslint-plugin-sonarjs');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = defineConfig(
  {
    files: ['eslint.config.js'],
    extends: [eslint.configs.recommended, eslintPluginPrettierRecommended],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
    plugins: { sonarjs },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'sonarjs/deprecation': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      eslintPluginPrettierRecommended,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { sonarjs },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'sonarjs/deprecation': 'error',
    },
  },
);
