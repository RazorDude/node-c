import { Injectable } from '@nestjs/common';

import type { DomainEntityServiceDefaultData } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { DomainEntityService, LoggerService } from '@node-c/core';

// biome-ignore lint/style/useImportType: DI.
import { DataCacheCoursesEntityService } from '../../../../data/cache/entities/cache.entities.js';
import type { DataDBCourse } from '../../../../data/db/entities/courses/courses.entity.js';
// biome-ignore lint/style/useImportType: DI.
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
