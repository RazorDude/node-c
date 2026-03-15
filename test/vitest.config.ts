import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*/src/index.ts', '**/*.spec.ts'],
      include: ['**/*/src/*.ts', '**/*/src/**/*.ts']
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
