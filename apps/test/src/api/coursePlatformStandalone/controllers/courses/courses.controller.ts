import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityControler } from '@node-c/api-rest';

import { LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db';
import { DomainCoursePlatformStandaloneCoursesService } from '../../../../domain/coursePlatformStandalone';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformStandaloneCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformStandaloneCoursesService
> {
  constructor(domainEntityService: DomainCoursePlatformStandaloneCoursesService, logger: LoggerService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(), logger);
  }
}
