import { resolve } from 'node:path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/integration/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    setupFiles: ['reflect-metadata'],
    globalSetup: ['./test/integration/global-setup.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    isolate: false,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      src: resolve(import.meta.dirname, './src'),
    },
  },
});
