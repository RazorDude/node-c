import { Inject, Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
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
