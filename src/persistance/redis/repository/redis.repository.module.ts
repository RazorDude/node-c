import { DynamicModule, Module } from '@nestjs/common';

import { RedisRepositoryModuleOptions } from './redis.repository.definitions';
import { RedisRepositoryService } from './redis.repository.service';

import { RedisStoreModule } from '../store';

import { Constants } from '../../../common/definitions';

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
