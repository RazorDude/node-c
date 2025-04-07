import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { UserAccountStatus, UserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class UserAccountStatusesService extends TypeORMEntityService<UserAccountStatus> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<UserAccountStatus>
  ) {
    super(qb, repository, UserAccountStatusEntity);
  }
}
