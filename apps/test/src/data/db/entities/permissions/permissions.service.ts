import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBPermission, DataDBPermissionEntity } from './permissions.entity';

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
