import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/index.ts', 'dist', 'test']
    },
    globalSetup: 'test/vitest.globalSetup.ts',
    include: ['test/**/*.spec.ts']
  }
});
