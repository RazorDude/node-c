import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import { type DataDBLesson, DataDBLessonEntity } from './lessons.entity.js';

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
