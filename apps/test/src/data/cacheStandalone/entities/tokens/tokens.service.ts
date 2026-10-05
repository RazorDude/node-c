import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheStandaloneToken } from './tokens.entity.js';

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
