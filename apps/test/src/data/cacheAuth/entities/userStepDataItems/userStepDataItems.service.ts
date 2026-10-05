import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheAuthUserStepDataItem } from './userStepDataItems.entity.js';

@Injectable()
export class DataCacheAuthUserStepDataItemsEntityService extends RedisEntityService<DataCacheAuthUserStepDataItem> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheAuthUserStepDataItem>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
