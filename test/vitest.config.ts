import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // exclude: ['**/*/src/index.ts', 'dist', 'test']
      exclude: ['**/*/src/index.ts', '**/*.spec.ts'],
      include: ['**/*/src/*.ts', '**/*/src/**/*.ts']
    },
    exclude: ['apps/test/src/config/profiles/config.profile.test.ts'],
    globalSetup: 'test/vitest.globalSetup.ts',
    include: [
      // '**/*.spec.ts',
      'apps/test/**/*.spec.ts'
    ],
    // onConsoleLog(log: string, type: 'stdout' | 'stderr'): false | void {
    //   if (log.startsWith('[TestLog]:') && type === 'stdout') {
    //     console.info(log);
    //     return false;
    //   }
    // },
    projects: [
      'apps/*'
      // 'packages/*'
    ],
    silent: false
  }
});
