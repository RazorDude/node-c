import { DynamicModule, Module } from '@nestjs/common';

import { RedisRepositoryModuleOptions } from './redis.repository.definitions';
import { RedisRepositoryService } from './redis.repository.service';

import { Constants } from '../../../common/definitions';

// import { RedisStoreModule, RedisStoreService } from '../store';

@Module({})
export class RedisRepositoryModule {
  static register<Entity>(options: RedisRepositoryModuleOptions): DynamicModule {
    // const { persistanceModuleName, schema, storeKey } = options;
    const { schema } = options;
    return {
      module: RedisRepositoryModule,
      // imports: [RedisStoreModule.register({ persistanceModuleName, storeKey })],
      imports: [],
      providers: [
        {
          provide: Constants.REDIS_REPOSITORY_SCHEMA,
          useValue: schema
        },
        // TODO: provide RedisStoreService via a specific injection token
        RedisRepositoryService<Entity>
      ],
      // exports: [RedisRepositoryService, RedisStoreService]
      exports: [RedisRepositoryService<Entity>]
    };
  }
}
