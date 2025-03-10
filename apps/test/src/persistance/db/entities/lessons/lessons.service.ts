import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { Lesson, LessonEntity } from './lessons.entity';

@Injectable()
export class LessonsService extends RDBEntityService<Lesson> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(LessonEntity)
    repository: Repository<Lesson>
  ) {
    super(qb, repository, LessonEntity);
  }
}
