import { Injectable } from '@nestjs/common';

import { DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { DataCacheCoursesEntityService } from '../../../../data/cache/entities/cache.entities.js';
import { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import { DataDBCoursesService } from '../../../../data/db/entities/courses/courses.service.js';

@Injectable()
export class DomainCoursePlatformDelegatedCoursesService extends DomainEntityService<
  DataDBCourse,
  DataDBCoursesService,
  DomainEntityServiceDefaultData<DataDBCourse>,
  { cache: DataCacheCoursesEntityService }
> {
  constructor(
    protected cache: DataCacheCoursesEntityService,
    dataEntityService: DataDBCoursesService,
    logger: LoggerService
  ) {
    super(dataEntityService, undefined, logger, { cache });
  }
}
