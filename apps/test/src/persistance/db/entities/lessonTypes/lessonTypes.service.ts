import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { LessonType, LessonTypeEntity } from './lessonTypes.entity';

@Injectable()
export class LessonTypesService extends RDBEntityService<LessonType> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(LessonTypeEntity)
    entity: Repository<LessonType>
  ) {
    super(qb, entity, LessonTypeEntity);
  }
}
