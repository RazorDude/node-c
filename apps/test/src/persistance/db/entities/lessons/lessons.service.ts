import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { Lesson, LessonEntity } from './lessons.entity';

@Injectable()
export class LessonsService extends TypeORMDBEntityService<Lesson> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<Lesson>
  ) {
    super(qb, repository, LessonEntity);
  }
}
