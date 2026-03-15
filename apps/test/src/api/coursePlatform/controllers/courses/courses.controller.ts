import { Controller, Injectable } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { LoggerService } from '@node-c/core';

import { Course as DBCourse } from '../../../../data/db';
import { CoursePlatformCoursesService } from '../../../../domain/coursePlatform';

@Injectable()
@Controller('courses')
export class CoursePlatformCoursesEntityController extends RESTAPIEntityControler<
  DBCourse,
  CoursePlatformCoursesService
> {
  constructor(
    protected domainEntityService: CoursePlatformCoursesService,
    protected logger: LoggerService
  ) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DBCourse>(), logger);
  }
}
