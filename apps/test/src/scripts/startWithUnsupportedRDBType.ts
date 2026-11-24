import * as path from 'node:path';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  type AppConfigCommon,
  type AppConfigProfile,
  AppEnvironment,
  ConfigProviderModule,
  LoggerModule,
  RDBType
} from '@node-c/core';
import { SQLQueryBuilderModule } from '@node-c/data-rdb';

const dataModuleName = 'unsupportedDB';

const appConfigCommon: AppConfigCommon = {
  data: {
    [dataModuleName]: { type: RDBType.MySQL }
  },
  domain: {},
  general: {
    projectName: 'node-c-test-app-unsupported-rdb-type',
    projectRootPath: path.resolve(import.meta.dirname, '../../'),
    projectVersion: '1.0.0'
  }
};
const appConfigProfileEndToEndTests: AppConfigProfile = {
  general: { environment: AppEnvironment.Test }
};
const appConfigs = { appConfigCommon, appConfigProfileEndToEndTests };

// the type comes from DATA_UNSUPPORTED_DB_TYPE, since the config types only allow the supported ones
@Module({
  imports: [
    ConfigProviderModule.register({
      appConfigs,
      envKeys: { DATA: { RDB: { TYPE: 'type' } } },
      envKeysParentNames: {
        DATA: { children: { UNSUPPORTED_DB: dataModuleName }, name: 'data' }
      },
      envName: AppEnvironment.Test
    }),
    LoggerModule.register(),
    SQLQueryBuilderModule.register({ dataModuleName })
  ]
})
class AppModuleUnsupportedRDBType {}

// abortOnError: false makes Nest rethrow the startup error instead of logging it through the disabled logger
// and exiting, so that the error message reaches stderr
await NestFactory.createApplicationContext(AppModuleUnsupportedRDBType, {
  abortOnError: false,
  logger: false
});
