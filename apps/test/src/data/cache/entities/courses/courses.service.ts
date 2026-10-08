import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheCourse } from './courses.entity.js';

@Injectable()
export class DataCacheCoursesEntityService extends RedisEntityService<DataCacheCourse> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheCourse>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
