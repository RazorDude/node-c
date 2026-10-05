import { Injectable } from '@nestjs/common';

import { DomainEntityService, type LoggerService } from '@node-c/core';

import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import type { DataDBCoursesService } from '../../../../data/db/entities/courses/courses.service.js';

@Injectable()
export class DomainCoursePlatformFederatedCoursesService extends DomainEntityService<
  DataDBCourse,
  DataDBCoursesService
> {
  constructor(dataEntityService: DataDBCoursesService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
