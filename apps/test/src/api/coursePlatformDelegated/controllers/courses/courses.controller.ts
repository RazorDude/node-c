import { Controller, Injectable } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { type DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';

import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformDelegatedCoursesService } from '../../../../domain/coursePlatformDelegated/services/courses/courses.service.js';
import type { CoursePlatformStandaloneCoursesFindDto } from './dto/find.dto.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformDelegatedCoursesEntityController extends RESTAPIEntityControler<
  DataDBCourse,
  DomainCoursePlatformDelegatedCoursesService,
  Omit<DefaultDtos<DataDBCourse>, 'find'> & {
    find: CoursePlatformStandaloneCoursesFindDto;
  }
> {
  constructor(
    domainEntityService: DomainCoursePlatformDelegatedCoursesService,
    logger: LoggerService
  ) {
    super(
      domainEntityService,
      RESTAPIEntityControler.getDefaultDtos<DataDBCourse>(),
      logger
    );
  }
}
