import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import { type DataDBRole, DataDBRoleEntity } from './roles.entity.js';

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
