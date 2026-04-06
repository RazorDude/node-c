import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBCategory, DataDBCategoryEntity } from './categories.entity';

@Injectable()
export class DataDBCategoriesService extends TypeORMDBEntityService<DataDBCategory> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBCategory>
  ) {
    super(configProvider, logger, qb, repository, DataDBCategoryEntity);
  }
}
