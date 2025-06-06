import { DynamicModule, Module } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';

import { RedisStoreModuleOptions } from './redis.store.definitions';
import { RedisStoreService } from './redis.store.service';

import { Constants } from '../common/definitions';

@Module({})
export class RedisStoreModule {
  static register(options: RedisStoreModuleOptions): DynamicModule {
    const { persistanceModuleName } = options;
    const serviceToken = `${persistanceModuleName}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`;
    return {
      global: true,
      module: RedisStoreModule,
      providers: [
        {
          provide: Constants.REDIS_CLIENT,
          useFactory: async (configProvider: ConfigProviderService) => {
            return await RedisStoreService.createClient(configProvider.config, { persistanceModuleName });
          },
          inject: [ConfigProviderService]
        },
        { provide: Constants.REDIS_CLIENT_PERSISTANCE_MODULE_NAME, useValue: persistanceModuleName },
        { provide: serviceToken, useClass: RedisStoreService }
      ],
      exports: [{ provide: serviceToken, useClass: RedisStoreService }]
    };
  }
}
