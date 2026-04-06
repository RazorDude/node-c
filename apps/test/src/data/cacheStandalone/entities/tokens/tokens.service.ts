import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheStandaloneToken } from './tokens.entity';

@Injectable()
export class DataCacheStandaloneTokensEntityService extends RedisEntityService<DataCacheStandaloneToken> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheStandaloneToken>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
