import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheAuthToken } from './tokens.entity';

@Injectable()
export class DataCacheAuthTokensEntityService extends RedisEntityService<DataCacheAuthToken> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheAuthToken>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
