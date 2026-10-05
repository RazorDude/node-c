import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import { type DataDBCourse, DataDBCourseEntity } from './courses.entity.js';

@Injectable()
export class DataDBCoursesService extends TypeORMDBEntityService<DataDBCourse> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBCourse>
  ) {
    super(configProvider, logger, qb, repository, DataDBCourseEntity);
  }
}
