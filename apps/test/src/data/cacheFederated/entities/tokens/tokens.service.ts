import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheFederatedToken } from './tokens.entity';

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
