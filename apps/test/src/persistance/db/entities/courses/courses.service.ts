import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { Course, CourseEntity } from './courses.entity';

@Injectable()
export class CoursesService extends TypeORMEntityService<Course> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<Course>
  ) {
    super(qb, repository, CourseEntity);
  }
}
