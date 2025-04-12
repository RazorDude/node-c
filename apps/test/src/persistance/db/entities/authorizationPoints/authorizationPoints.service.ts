import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { AuthorizationPoint, AuthorizationPointEntity } from './authorizationPoints.entity';

@Injectable()
export class AuthorizationPointsService extends TypeORMDBEntityService<AuthorizationPoint> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<AuthorizationPoint>
  ) {
    super(qb, repository, AuthorizationPointEntity);
  }
}
