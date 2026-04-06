import { DynamicModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import {
  AppModuleBase,
  AppModuleCoursePlatformDelegated,
  AppModuleCoursePlatformFederated,
  AppModuleCoursePlatformStandalone,
  AppModuleSSO
} from './app.module';
import { Constants } from './common/definitions';

(async function () {
  await NodeCApp.start(
    [
      AppModuleCoursePlatformDelegated,
      AppModuleCoursePlatformFederated,
      AppModuleCoursePlatformStandalone,
      AppModuleSSO
    ] as unknown as DynamicModule[],
    {
      apiModulesOptions: [
        { appModuleIndex: 0, apiModuleName: Constants.API_COURSE_PLATFORM_DELEGATED_MODULE_NAME },
        { appModuleIndex: 1, apiModuleName: Constants.API_COURSE_PLATFORM_FEDERATED_MODULE_NAME },
        { appModuleIndex: 2, apiModuleName: Constants.API_COURSE_PLATFORM_STANDALONE_MODULE_NAME },
        { appModuleIndex: 3, apiModuleName: Constants.API_SSO_MODULE_NAME }
      ],
      generateOrmConfig: true,
      loadConfigOptions: AppModuleBase.configProviderModuleRegisterOptions
    }
  );
})().then(
  () => console.info('App started.'),
  err => {
    console.error(err);
    process.exit(1);
  }
);
