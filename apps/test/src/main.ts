import { NestModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import { AppModuleBase, AppModuleCoursePlatform, AppModuleSSO } from './app.module';
import { Constants } from './common/definitions';

(async function () {
  await NodeCApp.start([AppModuleCoursePlatform, AppModuleSSO] as unknown as NestModule[], {
    apiModulesOptions: [
      { appModuleIndex: 0, apiModuleName: Constants.API_COURSE_PLATFORM_MODULE_NAME },
      { appModuleIndex: 1, apiModuleName: Constants.API_SSO_MODULE_NAME }
    ],
    generateOrmConfig: true,
    loadConfigOptions: AppModuleBase.configProviderModuleRegisterOptions
  });
})().then(
  () => console.info('App started.'),
  err => {
    console.error(err);
    process.exit(1);
  }
);
