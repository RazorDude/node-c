import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBCourse, DataDBCourseEntity } from './courses.entity';

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
