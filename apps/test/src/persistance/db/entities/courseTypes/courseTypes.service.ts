import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { CourseType, CourseTypeEntity } from './courseTypes.entity';

@Injectable()
export class CourseTypesService extends TypeORMDBEntityService<CourseType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<CourseType>
  ) {
    super(qb, repository, CourseTypeEntity);
  }
}
