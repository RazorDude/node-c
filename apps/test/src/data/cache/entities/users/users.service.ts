import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheUser } from './users.entity';

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
