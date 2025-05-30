import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/index.ts', 'dist', 'test']
    },
    include: ['test/**/*.spec.ts']
  }
});
