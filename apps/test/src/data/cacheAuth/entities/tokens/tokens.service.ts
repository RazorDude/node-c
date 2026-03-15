import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { CacheAuthToken } from './tokens.entity';

@Injectable()
export class CacheAuthTokensEntityService extends RedisEntityService<CacheAuthToken> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected repository: RedisRepositoryService<CacheAuthToken>,
    protected store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
