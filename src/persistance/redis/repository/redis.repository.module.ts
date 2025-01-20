import { DynamicModule, Module } from '@nestjs/common';

import { RedisRepositoryModuleOptions } from './redis.repository.definitions';
import { RedisRepositoryService } from './redis.repository.service';

import { Constants } from '../../../common/definitions';

import { RedisStoreModule } from '../store';

@Module({})
export class RedisRepositoryModule {
  static register(options: RedisRepositoryModuleOptions): DynamicModule {
    const { persistanceModuleName, schema, storeKey } = options;
    return {
      module: RedisRepositoryModule,
      imports: [RedisStoreModule.register({ persistanceModuleName, storeKey })],
      providers: [
        {
          provide: Constants.REDIS_REPOSITORY_SCHEMA,
          useValue: schema
        },
        RedisRepositoryService
      ],
      exports: [RedisRepositoryService]
    };
  }
}
