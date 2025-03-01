import { Injectable } from '@nestjs/common';

import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance-redis';

import { CacheAuthToken } from './tokens.entity';

@Injectable()
export class CacheAuthTokensEntityService extends RedisEntityService<CacheAuthToken> {
  constructor(
    protected repository: RedisRepositoryService<CacheAuthToken>,
    protected store: RedisStoreService
  ) {
    super(repository, store);
  }
}
