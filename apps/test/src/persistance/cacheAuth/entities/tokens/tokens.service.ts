import { Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance-redis';

import { CacheAuthToken } from './tokens.entity';

@Injectable()
export class CacheAuthTokensEntityService extends RedisEntityService<CacheAuthToken> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected repository: RedisRepositoryService<CacheAuthToken>,
    protected store: RedisStoreService
  ) {
    super(configProvider, repository, store);
  }
}
