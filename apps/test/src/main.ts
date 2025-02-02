import { NestModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import { AppModule } from './app.module';
import { Constants } from './common/definitions';

(async function () {
  await NodeCApp.start([AppModule] as unknown as NestModule[], {
    apiModulesOptions: [{ appModuleIndex: 0, apiModuleName: Constants.API_ADMIN_MODULE_NAME }],
    loadConfigOptions: AppModule.configProviderModuleRegisterOptions
  });
})().then(
  () => console.info('App started.'),
  err => {
    console.error(err);
    process.exit(1);
  }
);
