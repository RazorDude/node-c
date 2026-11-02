import { defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: Test file.
export default defineConfig({
  test: {
    // coverage: {
    //   allowExternal: true,
    //   enabled: false,
    //   exclude: [
    //     '**/*/src/index.ts',
    //     '**/*.spec.ts',
    //     'apps/tests/src/main.ts',
    //     'apps/test/src/data/*/migrations'
    //   ],
    //   include: ['**/*/src/*.ts', '**/*/src/**/*.ts'],
    //   provider: 'v8'
    // },
    environment: 'node',
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
