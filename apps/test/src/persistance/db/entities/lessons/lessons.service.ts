import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { Lesson, LessonEntity } from './lessons.entity';

@Injectable()
export class LessonsService extends TypeORMEntityService<Lesson> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<Lesson>
  ) {
    super(qb, repository, LessonEntity);
  }
}
