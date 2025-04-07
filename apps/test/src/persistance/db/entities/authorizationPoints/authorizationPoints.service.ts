import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { AuthorizationPoint, AuthorizationPointEntity } from './authorizationPoints.entity';

@Injectable()
export class AuthorizationPointsService extends TypeORMEntityService<AuthorizationPoint> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<AuthorizationPoint>
  ) {
    super(qb, repository, AuthorizationPointEntity);
  }
}
