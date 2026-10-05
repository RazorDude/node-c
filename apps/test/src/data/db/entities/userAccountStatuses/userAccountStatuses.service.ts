import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  type TypeORMDBRepository
} from '@node-c/data-typeorm';

import {
  type DataDBUserAccountStatus,
  DataDBUserAccountStatusEntity
} from './userAccountStatuses.entity.js';

@Injectable()
export class DataDBUserAccountStatusesService extends TypeORMDBEntityService<DataDBUserAccountStatus> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBUserAccountStatus>
  ) {
    super(
      configProvider,
      logger,
      qb,
      repository,
      DataDBUserAccountStatusEntity
    );
  }
}
