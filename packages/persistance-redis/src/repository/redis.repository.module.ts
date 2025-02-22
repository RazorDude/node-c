import { DynamicModule, Module } from '@nestjs/common';

import { RedisRepositoryModuleOptions } from './redis.repository.definitions';
import { RedisRepositoryService } from './redis.repository.service';

import { Constants } from '../common/definitions';
import { RedisStoreService } from '../store';

@Module({})
export class RedisRepositoryModule {
  static register<Entity>(options: RedisRepositoryModuleOptions): DynamicModule {
    // TODO: remove storeKey and use persistanceModuleName instead
    const { schema, storeKey } = options;
    return {
      module: RedisRepositoryModule,
      imports: [],
      providers: [
        {
          provide: Constants.REDIS_REPOSITORY_SCHEMA,
          useValue: schema
        },
        {
          provide: RedisStoreService,
          useFactory: (redisStoreService: RedisStoreService) => redisStoreService,
          inject: [`${storeKey}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`]
        },
        RedisRepositoryService<Entity>
      ],
      exports: [RedisRepositoryService<Entity>, RedisStoreService]
    };
  }
}
