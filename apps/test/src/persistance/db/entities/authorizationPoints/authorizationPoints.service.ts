import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { AuthorizationPoint, AuthorizationPointEntity } from './authorizationPoints.entity';

@Injectable()
export class AuthorizationPointsService extends RDBEntityService<AuthorizationPoint> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<AuthorizationPoint>
  ) {
    super(qb, repository, AuthorizationPointEntity);
  }
}
