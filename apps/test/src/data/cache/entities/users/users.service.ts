import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheUser } from './users.entity.js';

@Injectable()
export class DataCacheUsersEntityService extends RedisEntityService<DataCacheUser> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheUser>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
