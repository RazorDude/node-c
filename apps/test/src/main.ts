/* oxlint-disable eslint/no-console -- No other way before the logger service is initialized. */
import process from 'node:process';

import { DynamicModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import {
  AppModuleBase,
  AppModuleCoursePlatformDelegated,
  AppModuleCoursePlatformFederated,
  AppModuleCoursePlatformStandalone,
  AppModuleOktaMock,
  AppModuleSSO
} from './app.module.js';
import { Constants } from './common/definitions/common.constants.js';

(async (): Promise<void> => {
  const apps = await NodeCApp.start(
    [
      AppModuleCoursePlatformDelegated,
      AppModuleCoursePlatformFederated,
      AppModuleCoursePlatformStandalone,
      AppModuleSSO,
      AppModuleOktaMock
    ] as unknown as DynamicModule[],
    {
      apiModulesOptions: [
        {
          appModuleIndex: 0,
          apiModuleName: Constants.API_COURSE_PLATFORM_DELEGATED_MODULE_NAME
        },
        {
          appModuleIndex: 1,
          apiModuleName: Constants.API_COURSE_PLATFORM_FEDERATED_MODULE_NAME
        },
        {
          appModuleIndex: 2,
          apiModuleName: Constants.API_COURSE_PLATFORM_STANDALONE_MODULE_NAME
        },
        { appModuleIndex: 3, apiModuleName: Constants.API_SSO_MODULE_NAME },
        {
          appModuleIndex: 4,
          apiModuleName: Constants.API_OKTA_MOCK_MODULE_NAME
        }
      ],
      generateOrmConfig: true,
      loadConfigOptions: AppModuleBase.configProviderModuleRegisterOptions
    }
  );
  // On kill -INT (e.g. from the e2e teardown), close the apps and exit normally,
  // so that V8 writes the coverage data from NODE_V8_COVERAGE before the process ends.
  process.once('SIGINT', () => {
    void Promise.all(apps.map((app) => app.close())).finally(() =>
      process.exit(0)
    );
  });
})().then(
  () => console.info('App started.'),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
