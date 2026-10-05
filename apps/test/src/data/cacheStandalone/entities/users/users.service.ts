import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheStandaloneUser } from './users.entity.js';

@Injectable()
export class DataCacheStandaloneUsersEntityService extends RedisEntityService<DataCacheStandaloneUser> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheStandaloneUser>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
