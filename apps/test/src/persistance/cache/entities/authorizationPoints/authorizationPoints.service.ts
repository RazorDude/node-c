import { Injectable } from '@nestjs/common';

import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance-redis';

import { AuthorizationPoint } from './authorizationPoints.entity';

@Injectable()
export class CacheAuthorizationPointsEntityService extends RedisEntityService<AuthorizationPoint> {
  constructor(
    protected repository: RedisRepositoryService<AuthorizationPoint>,
    protected store: RedisStoreService
  ) {
    super(repository, store);
    console.log('===> CacheAuthorizationPointsEntityService init');
  }
}
