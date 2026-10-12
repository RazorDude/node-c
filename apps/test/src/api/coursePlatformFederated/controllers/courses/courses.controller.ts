import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityController } from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import { DomainCoursePlatformFederatedCoursesService } from '../../../../domain/coursePlatformFederated/services/courses/courses.service.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformFederatedCoursesEntityController extends RESTAPIEntityController<
  DataDBCourse,
  DomainCoursePlatformFederatedCoursesService
> {
  constructor(
    domainEntityService: DomainCoursePlatformFederatedCoursesService,
    logger: LoggerService,
    reflector: Reflector
  ) {
    super(
      domainEntityService,
      RESTAPIEntityController.getDefaultDtos<DataDBCourse>(),
      logger,
      reflector
    );
  }
}
