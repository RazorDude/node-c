import { Injectable } from '@nestjs/common';

import { DomainEntityService } from '@node-c/core';

import { Course as DBCourse, CoursesService as DBCoursesService } from '../../../../persistance/db';

@Injectable()
export class CoursePlatformCoursesService extends DomainEntityService<DBCourse, DBCoursesService> {
  constructor(protected persistanceEntityService: DBCoursesService) {
    super(persistanceEntityService);
  }
}
