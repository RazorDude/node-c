import { Injectable } from '@nestjs/common';

import { DomainEntityService } from '@node-c/core';

import { Course as DBCourse, CoursesService as DBCoursesService } from '../../../../data/db';

@Injectable()
export class CoursePlatformCoursesService extends DomainEntityService<DBCourse, DBCoursesService> {
  constructor(protected dataEntityService: DBCoursesService) {
    super(dataEntityService);
  }
}
