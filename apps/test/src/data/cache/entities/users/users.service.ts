import { Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { CacheUser } from './users.entity';

@Injectable()
export class CacheUsersEntityService extends RedisEntityService<CacheUser> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected repository: RedisRepositoryService<CacheUser>,
    protected store: RedisStoreService
  ) {
    super(configProvider, repository, store);
  }
}
