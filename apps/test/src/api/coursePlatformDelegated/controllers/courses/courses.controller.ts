import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityControler } from '@node-c/api-rest';

import { LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db';
import { DomainCoursePlatformDelegatedCoursesService } from '../../../../domain/coursePlatformDelegated';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformDelegatedCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformDelegatedCoursesService
> {
  constructor(domainEntityService: DomainCoursePlatformDelegatedCoursesService, logger: LoggerService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(), logger);
  }
}
