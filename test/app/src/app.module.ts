import { Module } from '@nestjs/common';

import {
  APP_CONFIG_FROM_ENV_KEYS,
  ConfigProviderModule,
  ConfigProviderModuleOptions
} from '@node-c/common/configProvider';

import * as AppConfigs from './config';
// import { DomainAccessModule } from './domain/access';
// import { DBModule } from './persistance/db';

export const configProviderModuleRegisterOptions: ConfigProviderModuleOptions = {
  appConfigs: AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs'],
  envKeys: APP_CONFIG_FROM_ENV_KEYS,
  envKeysParentNames: {
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

@Module({
  imports: [ConfigProviderModule.register(configProviderModuleRegisterOptions)]
})
export class AppModule {}
