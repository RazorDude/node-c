import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { DomainEntityService, LoggerService } from '@node-c/core';

import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DataDBCoursesService } from '../../../../data/db/entities/courses/courses.service.js';

@Injectable()
export class DomainCoursePlatformFederatedCoursesService extends DomainEntityService<
  DataDBCourse,
  DataDBCoursesService
> {
  constructor(dataEntityService: DataDBCoursesService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
