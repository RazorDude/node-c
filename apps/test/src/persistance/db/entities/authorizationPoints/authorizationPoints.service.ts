import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { AuthorizationPoint, AuthorizationPointEntity } from './authorizationPoints.entity';

@Injectable()
export class AuthorizationPointsService extends TypeORMDBEntityService<AuthorizationPoint> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<AuthorizationPoint>
  ) {
    super(configProvider, qb, repository, AuthorizationPointEntity);
  }
}
