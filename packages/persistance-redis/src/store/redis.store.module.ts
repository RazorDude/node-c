import { DynamicModule, Module } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';

import { RedisStoreModuleOptions } from './redis.store.definitions';
import { RedisStoreService } from './redis.store.service';

import { Constants } from '../common/definitions';

@Module({})
export class RedisStoreModule {
  static register(options: RedisStoreModuleOptions): DynamicModule {
    const { persistanceModuleName, storeKey } = options;
    const serviceToken = `${storeKey}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`;
    console.log('===> RedisStoreModule.register', serviceToken)
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
        { provide: Constants.REDIS_CLIENT_STORE_KEY, useValue: storeKey },
        RedisStoreService
      ],
      // exports: [{ provide: serviceToken, useClass: RedisStoreService }]
    };
  }
}
