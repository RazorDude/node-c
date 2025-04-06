import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { CourseType, CourseTypeEntity } from './courseTypes.entity';

@Injectable()
export class CourseTypesService extends RDBEntityService<CourseType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<CourseType>
  ) {
    super(qb, repository, CourseTypeEntity);
  }
}
