import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessControlContext } from '@node-c/api-http';
import {
  DefaultDtos,
  FindDto,
  FindOneWithSaveAddtionalOptionsDto,
  FindWithSaveAddtionalOptionsDto,
  RESTAPIEntityController
} from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import { DomainCoursePlatformDelegatedCoursesService } from '../../../../domain/coursePlatformDelegated/services/courses/courses.service.js';

@AccessControlContext('CoursePlatformCoursesEntityController')
@Injectable()
@Controller('courses')
export class APICoursePlatformDelegatedCoursesEntityController extends RESTAPIEntityController<
  DataDBCourse,
  DomainCoursePlatformDelegatedCoursesService,
  Omit<DefaultDtos<DataDBCourse>, 'find' | 'findOne'> & {
    find: FindWithSaveAddtionalOptionsDto;
    findOne: FindOneWithSaveAddtionalOptionsDto;
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
        find: FindWithSaveAddtionalOptionsDto as unknown as FindDto,
        findOne: FindOneWithSaveAddtionalOptionsDto as unknown as FindDto
      },
      logger,
      reflector
    );
  }
}
