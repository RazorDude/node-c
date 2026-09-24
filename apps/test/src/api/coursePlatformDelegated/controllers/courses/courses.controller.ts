import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';

import { LoggerService } from '@node-c/core';

import { CoursePlatformStandaloneCoursesFindDto } from './dto/find.dto.js';

import { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import { DomainCoursePlatformDelegatedCoursesService } from '../../../../domain/coursePlatformDelegated/services/courses/courses.service.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformDelegatedCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformDelegatedCoursesService,
  Omit<DefaultDtos<DataDBCourse>, 'find'> & { find: CoursePlatformStandaloneCoursesFindDto }
> {
  constructor(domainEntityService: DomainCoursePlatformDelegatedCoursesService, logger: LoggerService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(), logger);
  }
}
