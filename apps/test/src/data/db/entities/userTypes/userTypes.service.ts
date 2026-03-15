import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { UserType, UserTypeEntity } from './userTypes.entity';

@Injectable()
export class UserTypesService extends TypeORMDBEntityService<UserType> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<UserType>
  ) {
    super(configProvider, logger, qb, repository, UserTypeEntity);
  }
}
