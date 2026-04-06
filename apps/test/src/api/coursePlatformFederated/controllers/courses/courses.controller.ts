import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityControler } from '@node-c/api-rest';

import { LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db';
import { DomainCoursePlatformFederatedCoursesService } from '../../../../domain/coursePlatformFederated';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformFederatedCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformFederatedCoursesService
> {
  constructor(domainEntityService: DomainCoursePlatformFederatedCoursesService, logger: LoggerService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(), logger);
  }
}
