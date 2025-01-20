import { DynamicModule, Module } from '@nestjs/common';

import { RedisStoreModuleOptions } from './redis.store.definitions';
import { RedisStoreService } from './redis.store.service';

import { ConfigProviderService } from '../../../common/configProvider';
import { Constants } from '../../../common/definitions';

@Module({})
export class RedisStoreModule {
  static register(options: RedisStoreModuleOptions): DynamicModule {
    const { persistanceModuleName, storeKey } = options;
    return {
      module: RedisStoreModule,
      providers: [
        {
          provide: Constants.REDIS_CLIENT,
          useFactory: async (configProvider: ConfigProviderService) =>
            await RedisStoreService.createClient(configProvider.config, { persistanceModuleName }),
          inject: [ConfigProviderService]
        },
        {
          provide: Constants.REDIS_CLIENT_STORE_KEY,
          useValue: storeKey
        },
        RedisStoreService
      ],
      exports: [RedisStoreService]
    };
  }
}
