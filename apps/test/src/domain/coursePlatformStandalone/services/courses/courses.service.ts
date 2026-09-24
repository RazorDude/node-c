import { Injectable } from '@nestjs/common';

import { DomainEntityService, LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import { DataDBCoursesService } from '../../../../data/db/entities/courses/courses.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneCoursesService extends DomainEntityService<
  DataDBCourse,
  DataDBCoursesService
> {
  constructor(dataEntityService: DataDBCoursesService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
