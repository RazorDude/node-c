import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import {
  type DataDBLessonType,
  DataDBLessonTypeEntity
} from './lessonTypes.entity.js';

@Injectable()
export class DataDBLessonTypesService extends TypeORMDBEntityService<DataDBLessonType> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBLessonType>
  ) {
    super(configProvider, logger, qb, repository, DataDBLessonTypeEntity);
  }
}
