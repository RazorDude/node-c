import { Injectable } from '@nestjs/common';

import { DomainEntityService, LoggerService } from '@node-c/core';

import { DataDBCourse, DataDBCoursesService } from '../../../../data/db';

@Injectable()
export class DomainCoursePlatformFederatedCoursesService extends DomainEntityService<
  DataDBCourse,
  DataDBCoursesService
> {
  constructor(dataEntityService: DataDBCoursesService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
