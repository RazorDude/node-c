import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { LessonType, LessonTypeEntity } from './lessonTypes.entity';

@Injectable()
export class LessonTypesService extends TypeORMDBEntityService<LessonType> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<LessonType>
  ) {
    super(configProvider, qb, repository, LessonTypeEntity);
  }
}
