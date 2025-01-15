import { DynamicModule, Module } from '@nestjs/common';

import { RedisRepositoryModuleOptions } from './redis.repository.definitions';
import { RedisRepositoryService } from './redis.repository.service';

import { Constants } from '../../../common/definitions';

@Module({})
export class RedisRepositoryModule {
  static register(options: RedisRepositoryModuleOptions): DynamicModule {
    const { schema } = options;
    return {
      module: RedisRepositoryModule,
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
