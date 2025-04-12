import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { Course, CourseEntity } from './courses.entity';

@Injectable()
export class CoursesService extends TypeORMDBEntityService<Course> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<Course>
  ) {
    super(qb, repository, CourseEntity);
  }
}
