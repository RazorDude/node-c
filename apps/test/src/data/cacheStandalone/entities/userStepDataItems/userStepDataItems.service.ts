import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheStandaloneUserStepDataItem } from './userStepDataItems.entity.js';

@Injectable()
export class DataCacheStandaloneUserStepDataItemsEntityService extends RedisEntityService<DataCacheStandaloneUserStepDataItem> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheStandaloneUserStepDataItem>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
