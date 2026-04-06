import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheStandaloneUser } from './users.entity';

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
