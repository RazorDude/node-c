import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { UserType, UserTypeEntity } from './userTypes.entity';

@Injectable()
export class UserTypesService extends TypeORMEntityService<UserType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<UserType>
  ) {
    super(qb, repository, UserTypeEntity);
  }
}
