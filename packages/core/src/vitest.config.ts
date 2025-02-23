import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/index.ts', 'src/vitest.config.ts', 'src/**/*/*definitions.ts', 'dist']
    }
  }
});
