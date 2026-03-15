import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { AuthorizationPoint, AuthorizationPointEntity } from './authorizationPoints.entity';

@Injectable()
export class AuthorizationPointsService extends TypeORMDBEntityService<AuthorizationPoint> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<AuthorizationPoint>
  ) {
    super(configProvider, logger, qb, repository, AuthorizationPointEntity);
  }
}
