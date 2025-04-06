import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { UserAccountStatus, UserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class UserAccountStatusesService extends RDBEntityService<UserAccountStatus> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<UserAccountStatus>
  ) {
    super(qb, repository, UserAccountStatusEntity);
  }
}
