import { Injectable } from '@nestjs/common';

import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance-redis';

import { CacheToken } from './tokens.entity';

@Injectable()
export class CacheTokensEntityService extends RedisEntityService<CacheToken> {
  constructor(
    protected repository: RedisRepositoryService<CacheToken>,
    protected store: RedisStoreService
  ) {
    super(repository, store);
  }
}
