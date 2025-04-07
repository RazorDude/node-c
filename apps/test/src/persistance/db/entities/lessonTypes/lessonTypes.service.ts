import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { LessonType, LessonTypeEntity } from './lessonTypes.entity';

@Injectable()
export class LessonTypesService extends TypeORMEntityService<LessonType> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<LessonType>
  ) {
    super(qb, repository, LessonTypeEntity);
  }
}
