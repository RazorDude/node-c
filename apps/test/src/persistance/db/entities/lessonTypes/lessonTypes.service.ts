import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { LessonType, LessonTypeEntity } from './lessonTypes.entity';

@Injectable()
export class LessonTypesService extends RDBEntityService<LessonType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<LessonType>
  ) {
    super(qb, repository, LessonTypeEntity);
  }
}
