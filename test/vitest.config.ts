import { defineConfig } from 'vitest/config';
import { BaseSequencer, type TestSpecification } from 'vitest/node';

// The e2e test files share the same running apps and data, and each one builds on the data of the previous ones,
// so they are run one by one, in the order of their names.
class AlphabeticalSequencer extends BaseSequencer {
  // oxlint-disable-next-line eslint/require-await -- The base method is async.
  async sort(files: TestSpecification[]): Promise<TestSpecification[]> {
    return [...files].sort((a, b) => a.moduleId.localeCompare(b.moduleId));
  }
}

export default defineConfig({
  test: {
    fileParallelism: false,
    sequence: { sequencer: AlphabeticalSequencer },
    environment: 'node',
    exclude: [
      'apps/test/src/config/profiles/config.profile.test.ts'
      // 'apps/test/test/e2e/0[8-9].*.e2e.spec.ts'
    ],
    globalSetup: 'test/vitest.globalSetup.ts',
    include: ['apps/test/test/e2e/[0-9][0-9].*.e2e.spec.ts'],
    silent: false
  }
});
