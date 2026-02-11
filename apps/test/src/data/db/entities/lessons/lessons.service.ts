import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { Lesson, LessonEntity } from './lessons.entity';

@Injectable()
export class LessonsService extends TypeORMDBEntityService<Lesson> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<Lesson>
  ) {
    super(configProvider, qb, repository, LessonEntity);
  }
}
