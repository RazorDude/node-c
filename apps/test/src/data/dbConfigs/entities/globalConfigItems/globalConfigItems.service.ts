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
  type DataDBConfigsGlobalConfigItem,
  DataDBConfigsGlobalConfigItemEntity
} from './globalConfigItems.entity.js';

@Injectable()
export class DataDBConfigsGlobalConfigItemsService extends TypeORMDBEntityService<DataDBConfigsGlobalConfigItem> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBConfigsGlobalConfigItem>
  ) {
    super(
      configProvider,
      logger,
      qb,
      repository,
      DataDBConfigsGlobalConfigItemEntity
    );
  }
}
