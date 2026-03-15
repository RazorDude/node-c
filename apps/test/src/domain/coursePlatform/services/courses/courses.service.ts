import { Injectable } from '@nestjs/common';

import { DomainEntityService, LoggerService } from '@node-c/core';

import { Course as DBCourse, CoursesService as DBCoursesService } from '../../../../data/db';

@Injectable()
export class CoursePlatformCoursesService extends DomainEntityService<DBCourse, DBCoursesService> {
  constructor(
    protected dataEntityService: DBCoursesService,
    protected logger: LoggerService
  ) {
    super(dataEntityService, undefined, logger);
  }
}
