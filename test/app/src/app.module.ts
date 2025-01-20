import { Module, NestModule } from '@nestjs/common';

import {
  APP_CONFIG_FROM_ENV_KEYS,
  ConfigProviderModule,
  ConfigProviderModuleOptions
} from '@node-c/common/configProvider';

import * as AppConfigs from './config';
// import { DomainAccessModule } from './domain/access';
// import { DBModule } from './persistance/db';;

@Module({
  imports: [...AppModule.imports]
})
export class AppModule implements NestModule {
  configure(): void {}

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
  static readonly imports = [ConfigProviderModule.register(AppModule.configProviderModuleRegisterOptions)];
}
