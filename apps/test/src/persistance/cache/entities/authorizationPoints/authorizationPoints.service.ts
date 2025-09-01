import { Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance-redis';

import { AuthorizationPoint } from './authorizationPoints.entity';

@Injectable()
export class CacheAuthorizationPointsEntityService extends RedisEntityService<AuthorizationPoint> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected repository: RedisRepositoryService<AuthorizationPoint>,
    protected store: RedisStoreService
  ) {
    super(configProvider, repository, store);
  }
}
