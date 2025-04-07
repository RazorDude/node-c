import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { CourseType, CourseTypeEntity } from './courseTypes.entity';

@Injectable()
export class CourseTypesService extends TypeORMEntityService<CourseType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<CourseType>
  ) {
    super(qb, repository, CourseTypeEntity);
  }
}
