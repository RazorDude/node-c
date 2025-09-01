import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { UserAccountStatus, UserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class UserAccountStatusesService extends TypeORMDBEntityService<UserAccountStatus> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<UserAccountStatus>
  ) {
    super(configProvider, qb, repository, UserAccountStatusEntity);
  }
}
