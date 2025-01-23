import { Module } from '@nestjs/common';

import {
  APP_CONFIG_FROM_ENV_KEYS,
  ConfigProviderModule,
  ConfigProviderModuleOptions
} from '@node-c/common/configProvider';
import { RedisStoreModule } from '@node-c/persistance/redis';

// import { AdminAPIModule } from './api/admin';
import { Constants } from './common/definitions';
import * as AppConfigs from './config';
// import { DomainIAMModule } from './domain/iam';
// import { PersistanceCacheModule } from './persistance/cache';

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
          MAIN: 'main', // add another key _MODULE_TYPE - RDB
          CACHE: 'cache' // add another key _MODULE_TYPE - NOSQL
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
    })
    // PersistanceCacheModule.register(),
    // DomainIAMModule.register()
  ];
}

@Module({
  imports: [
    ...AppModuleBase.imports
    // AdminAPIModule.register(AdminAPIModule.moduleOptions)
  ]
})
export class AppModule extends AppModuleBase {}
