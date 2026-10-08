import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityControler } from '@node-c/api-rest';
// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';

import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneCoursesService } from '../../../../domain/coursePlatformStandalone/services/courses/courses.service.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformStandaloneCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformStandaloneCoursesService
> {
  constructor(
    domainEntityService: DomainCoursePlatformStandaloneCoursesService,
    logger: LoggerService
  ) {
    super(
      domainEntityService,
      RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(),
      logger
    );
  }
}
