import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Course, CourseEntity } from './courses.entity';

@Injectable()
export class CoursesService extends RDBEntityService<Course> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<Course>
  ) {
    super(qb, repository, CourseEntity);
  }
}
