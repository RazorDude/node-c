import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { UserAccountStatus, UserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class UserAccountStatusesService extends TypeORMDBEntityService<UserAccountStatus> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<UserAccountStatus>
  ) {
    super(configProvider, logger, qb, repository, UserAccountStatusEntity);
  }
}
