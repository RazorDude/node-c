import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBCourseType, DataDBCourseTypeEntity } from './courseTypes.entity';

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
