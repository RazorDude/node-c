import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityControler } from '@node-c/api-rest';
// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';

import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformFederatedCoursesService } from '../../../../domain/coursePlatformFederated/services/courses/courses.service.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformFederatedCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformFederatedCoursesService
> {
  constructor(
    domainEntityService: DomainCoursePlatformFederatedCoursesService,
    logger: LoggerService
  ) {
    super(
      domainEntityService,
      RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(),
      logger
    );
  }
}
