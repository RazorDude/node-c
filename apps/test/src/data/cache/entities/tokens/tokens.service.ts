import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { CacheToken } from './tokens.entity';

@Injectable()
export class CacheTokensEntityService extends RedisEntityService<CacheToken> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected repository: RedisRepositoryService<CacheToken>,
    protected store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
