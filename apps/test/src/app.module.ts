import { Module } from '@nestjs/common';

import {
  APP_CONFIG_FROM_ENV_KEYS,
  ConfigProviderModule,
  ConfigProviderModuleOptions,
  LoggerModule
} from '@node-c/core';

import ld from 'lodash';
// import pino from 'pino';

import { CoursePlatformAPIModule } from './api/coursePlatform';
import { SSOAPIModule } from './api/sso';
import * as AppConfigs from './config';
import { DataAuditModule } from './data/audit';
import { DataCacheModule } from './data/cache';
import { DataCacheAuthModule } from './data/cacheAuth';
import { DataDBModule } from './data/db';
import { DataDBConfigsModule } from './data/dbConfigs';
import { DomainCoursePlatformModule } from './domain/coursePlatform';
import { DomainIAMModule } from './domain/iam';

export class AppModuleBase {
  static readonly configProviderModuleRegisterOptions: ConfigProviderModuleOptions = {
    appConfigs: AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs'],
    envKeys: ld.merge(APP_CONFIG_FROM_ENV_KEYS, {
      DOMAIN: {
        IAM: {
          OAUTH2_OKTA_CLIENT_ID: 'authServiceSettings.okta.oauth2.clientId',
          OAUTH2_OKTA_CLIENT_SECRET: 'authServiceSettings.okta.oauth2.clientSecret',
          USER_LOCAL_PASSWORD_SECRET: 'authServiceSettings.userLocal.secretKey.hashingSecret'
        }
      }
    }),
    envKeysParentNames: {
      API: {
        children: {
          COURSE_PLATFORM: 'coursePlatform', // _MODULE_TYPE - REST
          SSO: 'sso' // _MODULE_TYPE - REST
        },
        name: 'api'
      },
      DOMAIN: {
        children: {
          IAM: 'iam' // _MODULE_TYPE - IAM
        },
        name: 'domain'
      },
      DATA: {
        children: {
          AUDIT: 'audit', // _MODULE_TYPE - RDB
          CACHE: 'cache', // _MODULE_TYPE - NOSQL
          CACHE_AUTH: 'cacheAuth', // _MODULE_TYPE - NOSQL
          DB: 'db', // _MODULE_TYPE - RDB
          DB_CONFIGS: 'dbConfigs' // _MODULE_TYPE - RDB
        },
        name: 'data'
      }
    },
    useEnvFile: true,
    useEnvFileWithPriority: true
  };
  static readonly imports = [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    LoggerModule.register(),
    DataAuditModule.register(),
    DataCacheAuthModule.register(),
    DataCacheModule.register(),
    DataDBConfigsModule.register(),
    DataDBModule.register(),
    DomainIAMModule.register()
  ];
}

@Module({
  imports: [
    ...AppModuleBase.imports,
    DomainCoursePlatformModule,
    CoursePlatformAPIModule.register(CoursePlatformAPIModule.moduleOptions)
  ]
})
export class AppModuleCoursePlatform extends AppModuleBase {}

@Module({
  imports: [...AppModuleBase.imports, SSOAPIModule.register(SSOAPIModule.moduleOptions)]
})
export class AppModuleSSO extends AppModuleBase {}
