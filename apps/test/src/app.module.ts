import { Module } from '@nestjs/common';

import { APP_CONFIG_FROM_ENV_KEYS, ConfigProviderModule, ConfigProviderModuleOptions } from '@node-c/core';

import { AdminAPIModule } from './api/admin';
import * as AppConfigs from './config';
import { DomainIAMModule } from './domain/iam';
import { PersistanceCacheModule } from './persistance/cache';
import { PersistanceDBModule } from './persistance/db';

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
          DB: 'db', // add another key _MODULE_TYPE - RDB
          CACHE: 'cache' // add another key _MODULE_TYPE - NOSQL
        },
        name: 'persistance'
      }
    }
  };
  static readonly imports = [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    PersistanceCacheModule.register(),
    PersistanceDBModule.register(),
    DomainIAMModule.register()
  ];
}

@Module({
  imports: [...AppModuleBase.imports, AdminAPIModule.register(AdminAPIModule.moduleOptions)]
})
export class AppModule extends AppModuleBase {}
