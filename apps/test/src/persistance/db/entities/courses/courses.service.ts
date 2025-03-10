import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { Course, CourseEntity } from './courses.entity';

@Injectable()
export class CoursesService extends RDBEntityService<Course> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(CourseEntity)
    repository: Repository<Course>
  ) {
    super(qb, repository, CourseEntity);
  }
}
