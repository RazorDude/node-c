import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      allowExternal: true,
      exclude: ['**/*/src/index.ts', '**/*.spec.ts', 'apps/tests/src/main.ts', 'apps/test/src/data/*/migrations'],
      include: ['**/*/src/*.ts', '**/*/src/**/*.ts'],
      provider: 'istanbul'
    },
    exclude: ['apps/test/src/config/profiles/config.profile.test.ts'],
    globalSetup: 'test/vitest.globalSetup.ts',
    include: [
      // '**/*.spec.ts',
      'apps/test/**/*.spec.ts'
    ],
    projects: ['apps/*'],
    silent: false
  }
});
