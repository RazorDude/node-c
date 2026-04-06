import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBUserAccountStatus, DataDBUserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class DataDBUserAccountStatusesService extends TypeORMDBEntityService<DataDBUserAccountStatus> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBUserAccountStatus>
  ) {
    super(configProvider, logger, qb, repository, DataDBUserAccountStatusEntity);
  }
}
