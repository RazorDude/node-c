import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheCourse } from './courses.entity.js';

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
