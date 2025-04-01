import { Module } from '@nestjs/common';

import { APP_CONFIG_FROM_ENV_KEYS, ConfigProviderModule, ConfigProviderModuleOptions } from '@node-c/core';

import { CoursePlatformAPIModule } from './api/coursePlatform';
import { SSOAPIModule } from './api/sso';
import * as AppConfigs from './config';
import { DomainCoursePlatformModule } from './domain/coursePlatform';
import { DomainIAMModule } from './domain/iam';
import { PersistanceCacheModule } from './persistance/cache';
import { PersistanceCacheAuthModule } from './persistance/cacheAuth';
import { PersistanceDBModule } from './persistance/db';
// import { PersistanceDBConfigsModule } from './persistance/dbConfigs';

export class AppModuleBase {
  static readonly configProviderModuleRegisterOptions: ConfigProviderModuleOptions = {
    appConfigs: AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs'],
    envKeys: APP_CONFIG_FROM_ENV_KEYS,
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
          IAM: 'iam' // add another key _MODULE_TYPE - IAM
        },
        name: 'domain'
      },
      PERSISTANCE: {
        children: {
          CACHE: 'cache', // add another key _MODULE_TYPE - NOSQL
          CACHE_AUTH: 'cacheAuth', // add another key _MODULE_TYPE - NOSQL
          DB: 'db', // add another key _MODULE_TYPE - RDB
          DB_CONFIGS: 'dbConfigs' // add another key _MODULE_TYPE - RDB
        },
        name: 'persistance'
      }
    }
  };
  static readonly imports = [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    PersistanceCacheAuthModule.register(),
    PersistanceCacheModule.register(),
    // PersistanceDBConfigsModule.register(),
    PersistanceDBModule.register(),
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
