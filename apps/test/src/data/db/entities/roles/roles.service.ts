import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBRole, DataDBRoleEntity } from './roles.entity';

@Injectable()
export class DataDBRolesService extends TypeORMDBEntityService<DataDBRole> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBRole>
  ) {
    super(configProvider, logger, qb, repository, DataDBRoleEntity);
  }
}
