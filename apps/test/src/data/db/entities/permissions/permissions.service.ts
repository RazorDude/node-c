import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import {
  type DataDBPermission,
  DataDBPermissionEntity
} from './permissions.entity.js';

@Injectable()
export class DataDBPermissionsService extends TypeORMDBEntityService<DataDBPermission> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBPermission>
  ) {
    super(configProvider, logger, qb, repository, DataDBPermissionEntity);
  }
}
