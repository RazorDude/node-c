import { Injectable } from '@nestjs/common';

import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/persistance-redis';

import { AccessControlPoint } from './accessControlPoints.entity';

@Injectable()
export class AccessControlPointsEntityService extends RedisEntityService<AccessControlPoint> {
  constructor(
    protected repository: RedisRepositoryService<AccessControlPoint>,
    protected store: RedisStoreService
  ) {
    super(repository, store);
  }
}
