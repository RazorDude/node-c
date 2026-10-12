import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessControlContext } from '@node-c/api-http';
import {
  DefaultDtos,
  FindDto,
  RESTAPIEntityController
} from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import { DomainCoursePlatformDelegatedCoursesService } from '../../../../domain/coursePlatformDelegated/services/courses/courses.service.js';

import { CoursePlatformStandaloneCoursesFindDto } from './dto/find.dto.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformDelegatedCoursesEntityController extends RESTAPIEntityController<
  DataDBCourse,
  DomainCoursePlatformDelegatedCoursesService,
  Omit<DefaultDtos<DataDBCourse>, 'find'> & {
    find: CoursePlatformStandaloneCoursesFindDto;
  }
> {
  constructor(
    domainEntityService: DomainCoursePlatformDelegatedCoursesService,
    logger: LoggerService,
    reflector: Reflector
  ) {
    super(
      domainEntityService,
      {
        ...RESTAPIEntityController.getDefaultDtos<DataDBCourse>(),
        find: CoursePlatformStandaloneCoursesFindDto as unknown as FindDto
      },
      logger,
      reflector
    );
  }
}
