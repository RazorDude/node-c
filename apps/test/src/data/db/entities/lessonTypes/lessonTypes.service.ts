import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBLessonType, DataDBLessonTypeEntity } from './lessonTypes.entity';

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
