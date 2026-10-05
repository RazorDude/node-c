import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import {
  type DataDBCourseType,
  DataDBCourseTypeEntity
} from './courseTypes.entity.js';

@Injectable()
export class DataDBCourseTypesService extends TypeORMDBEntityService<DataDBCourseType> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBCourseType>
  ) {
    super(configProvider, logger, qb, repository, DataDBCourseTypeEntity);
  }
}
