import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBLesson, DataDBLessonEntity } from './lessons.entity';

@Injectable()
export class DataDBLessonsService extends TypeORMDBEntityService<DataDBLesson> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBLesson>
  ) {
    super(configProvider, logger, qb, repository, DataDBLessonEntity);
  }
}
