import { Controller, Injectable } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { CoursePlatformCoursesService } from '../../../../domain/coursePlatform';
import { Course as DBCourse } from '../../../../persistance/db';

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
