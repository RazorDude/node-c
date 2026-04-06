import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCacheStandaloneUserStepDataItem } from './userStepDataItems.entity';

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
