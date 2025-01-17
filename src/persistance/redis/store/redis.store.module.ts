import { DynamicModule, Module } from '@nestjs/common';

import { RedisStoreModuleOptions } from './redis.store.definitions';
import { RedisStoreService } from './redis.store.service';

import { ConfigProviderService } from '../../../common/configProvider';
import { Constants } from '../../../common/definitions';

@Module({})
export class RedisStoreModule {
  static register(options: RedisStoreModuleOptions): DynamicModule {
    const { moduleName } = options;
    return {
      module: RedisStoreModule,
      providers: [
        {
          provide: Constants.REDIS_CLIENT,
          useFactory: async (configProvider: ConfigProviderService) =>
            await RedisStoreService.createClient(configProvider.config, { moduleName }),
          inject: [ConfigProviderService]
        },
        {
          provide: Constants.REDIS_CLIENT_STORE_KEY,
          useValue: options.storeKey
        },
        RedisStoreService
      ],
      exports: [RedisStoreService]
    };
  }
}
