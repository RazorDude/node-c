import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBConfigsGlobalConfigItem, DataDBConfigsGlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class DataDBConfigsGlobalConfigItemsService extends TypeORMDBEntityService<DataDBConfigsGlobalConfigItem> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBConfigsGlobalConfigItem>
  ) {
    super(configProvider, logger, qb, repository, DataDBConfigsGlobalConfigItemEntity);
  }
}
