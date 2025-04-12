import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { UserType, UserTypeEntity } from './userTypes.entity';

@Injectable()
export class UserTypesService extends TypeORMDBEntityService<UserType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<UserType>
  ) {
    super(qb, repository, UserTypeEntity);
  }
}
