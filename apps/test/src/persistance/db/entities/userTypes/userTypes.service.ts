import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { UserType, UserTypeEntity } from './userTypes.entity';

@Injectable()
export class UserTypesService extends RDBEntityService<UserType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<UserType>
  ) {
    super(qb, repository, UserTypeEntity);
  }
}
