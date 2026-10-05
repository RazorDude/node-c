import { Injectable } from '@nestjs/common';

import {
  DomainEntityService,
  type DomainEntityServiceDefaultData,
  type LoggerService
} from '@node-c/core';

import type { DataCacheCoursesEntityService } from '../../../../data/cache/entities/cache.entities.js';
import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
import type { DataDBCoursesService } from '../../../../data/db/entities/courses/courses.service.js';

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
