import { Module } from '@nestjs/common';

import { APP_CONFIG_FROM_ENV_KEYS, ConfigProviderModule, ConfigProviderModuleOptions } from '@node-c/core';
import { RedisStoreModule } from '@node-c/persistance-redis';

import { AdminAPIModule } from './api/admin';
import { Constants } from './common/definitions';
import * as AppConfigs from './config';
import { DomainIAMModule } from './domain/admin';
import { PersistanceCacheModule } from './persistance/cache';

export class AppModuleBase {
  static readonly configProviderModuleRegisterOptions: ConfigProviderModuleOptions = {
    appConfigs: AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs'],
    envKeys: {
      ...APP_CONFIG_FROM_ENV_KEYS,
      API: { ...APP_CONFIG_FROM_ENV_KEYS.API, ADMIN: { HOSTNAME: 'hostname', PORT: 'port' } }
    },
    envKeysParentNames: {
      API: {
        children: {
          ADMIN: 'admin'
        },
        name: 'api'
      },
      DOMAIN: {
        children: {
          ADMIN: 'admin'
        },
        name: 'domain'
      },
      PERSISTANCE: {
        children: {
          CACHE: 'cache'
        },
        name: 'persistance'
      }
    }
  };
  static readonly imports = [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    RedisStoreModule.register({
      persistanceModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      storeKey: Constants.PERSISTANCE_CACHE_MODULE_STORE_KEY
    }),
    PersistanceCacheModule.register(),
    DomainIAMModule.register()
  ];
}

@Module({
  imports: [...AppModuleBase.imports, AdminAPIModule.register(AdminAPIModule.moduleOptions)]
})
export class AppModule extends AppModuleBase {}
