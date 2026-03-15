import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { AuthorizationPoint } from './authorizationPoints.entity';

@Injectable()
export class CacheAuthorizationPointsEntityService extends RedisEntityService<AuthorizationPoint> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected repository: RedisRepositoryService<AuthorizationPoint>,
    protected store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
