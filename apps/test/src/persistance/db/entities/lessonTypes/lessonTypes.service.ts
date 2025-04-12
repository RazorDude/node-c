import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { LessonType, LessonTypeEntity } from './lessonTypes.entity';

@Injectable()
export class LessonTypesService extends TypeORMDBEntityService<LessonType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<LessonType>
  ) {
    super(qb, repository, LessonTypeEntity);
  }
}
