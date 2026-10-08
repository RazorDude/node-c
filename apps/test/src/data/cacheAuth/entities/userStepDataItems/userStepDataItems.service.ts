import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
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
