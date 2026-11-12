/* oxlint-disable eslint/no-console -- No other way before the logger service is initialized. */
import process from 'node:process';

import { DynamicModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import { AppModule, AppModuleBase } from './app.module.js';
import { Constants } from './common/definitions/common.constants.js';

(async () => {
  await NodeCApp.start([AppModule as unknown as DynamicModule], {
    apiModulesOptions: [
      { appModuleIndex: 0, apiModuleName: Constants.API_TASKS_MODULE_NAME }
    ],
    generateOrmConfig: true,
    loadConfigOptions: AppModuleBase.configProviderModuleRegisterOptions
  });
})().then(
  () => console.info('App started.'),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
