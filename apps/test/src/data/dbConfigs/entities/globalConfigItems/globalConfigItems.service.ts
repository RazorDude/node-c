import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { GlobalConfigItem, GlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class GlobalConfigItemsService extends TypeORMDBEntityService<GlobalConfigItem> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<GlobalConfigItem>
  ) {
    super(configProvider, logger, qb, repository, GlobalConfigItemEntity);
  }
}
