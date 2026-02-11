import { Controller, Injectable } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { Course as DBCourse } from '../../../../data/db';
import { CoursePlatformCoursesService } from '../../../../domain/coursePlatform';

@Injectable()
@Controller('courses')
export class CoursePlatformCoursesEntityController extends RESTAPIEntityControler<
  DBCourse,
  CoursePlatformCoursesService
> {
  constructor(protected domainEntityService: CoursePlatformCoursesService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DBCourse>());
  }
}
