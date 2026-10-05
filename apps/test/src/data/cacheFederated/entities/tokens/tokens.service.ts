import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheFederatedToken } from './tokens.entity.js';

@Injectable()
export class DataCacheFederatedTokensEntityService extends RedisEntityService<DataCacheFederatedToken> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheFederatedToken>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
