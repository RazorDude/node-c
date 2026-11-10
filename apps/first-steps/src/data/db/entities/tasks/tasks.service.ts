import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  TypeORMDBRepository
} from '@node-c/data-typeorm';

import { DataDBTask, DataDBTaskEntity } from './tasks.entity.js';

@Injectable()
export class DataDBTasksService extends TypeORMDBEntityService<DataDBTask> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBTask>
  ) {
    super(configProvider, logger, qb, repository, DataDBTaskEntity);
  }
}
