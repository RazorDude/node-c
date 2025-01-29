import { Injectable } from '@nestjs/common';

import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance/redis';

import { CacheUser } from './users.entity';

@Injectable()
export class CacheUsersEntityService extends RedisEntityService<CacheUser> {
  constructor(
    protected repository: RedisRepositoryService<CacheUser>,
    protected store: RedisStoreService
  ) {
    super(repository, store);
  }
}
