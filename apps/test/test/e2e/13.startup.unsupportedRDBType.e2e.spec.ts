import { spawn } from 'node:child_process';
import * as path from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

describe('NodeC.Apps.Test - startup with an unsupported RDB type', () => {
  it('should fail to start when a data module has an unsupported RDB type', async () => {
    const { exitCode, output } = await new Promise<{
      exitCode: number | null;
      output: string;
    }>((resolve) => {
      let processOutput = '';
      const appProcess = spawn(
        'node',
        [
          path.resolve(
            import.meta.dirname,
            '../../dist/scripts/startWithUnsupportedRDBType.js'
          )
        ],
        {
          env: {
            DATA_UNSUPPORTED_DB_MODULE_TYPE: 'RDB',
            DATA_UNSUPPORTED_DB_TYPE: 'oracle',
            PATH: process.env.PATH
          }
        }
      );
      appProcess.stdout.on('data', (data: Buffer) => {
        processOutput += data.toString();
      });
      appProcess.stderr.on('data', (data: Buffer) => {
        processOutput += data.toString();
      });
      appProcess.on('exit', (code) => {
        resolve({ exitCode: code, output: processOutput });
      });
    });
    expect(exitCode).not.toEqual(0);
    expect(output).toContain('Unsupported RDB type "oracle"');
  });
});
