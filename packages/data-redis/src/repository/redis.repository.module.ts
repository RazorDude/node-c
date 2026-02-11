import { DynamicModule, Module } from '@nestjs/common';

import { Constants as CoreConstants } from '@node-c/core';

import { RedisRepositoryModuleOptions } from './redis.repository.definitions';
import { RedisRepositoryService } from './redis.repository.service';

import { Constants } from '../common/definitions';
import { RedisStoreService } from '../store';

@Module({})
export class RedisRepositoryModule {
  static register<Entity>(options: RedisRepositoryModuleOptions): DynamicModule {
    const { dataModuleName, schema } = options;
    return {
      module: RedisRepositoryModule,
      imports: [],
      providers: [
        {
          provide: Constants.REDIS_REPOSITORY_SCHEMA,
          useValue: schema
        },
        { provide: CoreConstants.PERSISTANCE_MODULE_NAME, useValue: dataModuleName },
        {
          provide: RedisStoreService,
          useFactory: (redisStoreService: RedisStoreService) => redisStoreService,
          inject: [`${dataModuleName}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`]
        },
        RedisRepositoryService<Entity>
      ],
      exports: [RedisRepositoryService<Entity>, RedisStoreService]
    };
  }
}
