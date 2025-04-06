import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Lesson, LessonEntity } from './lessons.entity';

@Injectable()
export class LessonsService extends RDBEntityService<Lesson> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<Lesson>
  ) {
    super(qb, repository, LessonEntity);
  }
}
