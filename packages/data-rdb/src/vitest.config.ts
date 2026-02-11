import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['dist', 'src/index.ts', 'src/vitest.config.ts', 'src/**/*/*definitions.ts', 'test']
    },
    exclude: ['src/sqlQueryBuilder/sqlQueryBuilder.service.helpers.spec.ts']
  }
});
