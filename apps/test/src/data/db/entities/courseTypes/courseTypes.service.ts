import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { CourseType, CourseTypeEntity } from './courseTypes.entity';

@Injectable()
export class CourseTypesService extends TypeORMDBEntityService<CourseType> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<CourseType>
  ) {
    super(configProvider, qb, repository, CourseTypeEntity);
  }
}
