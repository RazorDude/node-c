import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import {
  type DataDBCategory,
  DataDBCategoryEntity
} from './categories.entity.js';

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
