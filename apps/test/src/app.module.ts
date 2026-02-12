import { Module } from '@nestjs/common';

import { APP_CONFIG_FROM_ENV_KEYS, ConfigProviderModule, ConfigProviderModuleOptions } from '@node-c/core';

import ld from 'lodash';

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
      IAM: {
        OAUTH2_OKTA_CLIENT_ID: 'oauth2.okta.clientId',
        OAUTH2_OKTA_CLIENT_SECRET: 'oauth2.okta.clientSecret'
      }
    }),
    envKeysParentNames: {
      API: {
        children: {
          HTTP: 'http',
          REST: 'rest'
        },
        name: 'api'
      },
      DOMAIN: {
        children: {
          IAM: 'iam' // add another key to the .env file _MODULE_TYPE - IAM
        },
        name: 'domain'
      },
      PERSISTANCE: {
        children: {
          AUDIT: 'audit', // add another key to the .env file _MODULE_TYPE - RDB
          CACHE: 'cache', // add another key to the .env file _MODULE_TYPE - NOSQL
          CACHE_AUTH: 'cacheAuth', // add another key to the .env file _MODULE_TYPE - NOSQL
          DB: 'db', // add another key to the .env file _MODULE_TYPE - RDB
          DB_CONFIGS: 'dbConfigs' // add another key to the .env file _MODULE_TYPE - RDB
        },
        name: 'data'
      }
    },
    useEnvFile: true,
    useEnvFileWithPriority: true
  };
  static readonly imports = [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
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
