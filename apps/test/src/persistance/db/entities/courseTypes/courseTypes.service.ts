import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { CourseType, CourseTypeEntity } from './courseTypes.entity';

@Injectable()
export class CourseTypesService extends RDBEntityService<CourseType> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(CourseTypeEntity)
    entity: Repository<CourseType>
  ) {
    super(qb, entity, CourseTypeEntity);
  }
}
