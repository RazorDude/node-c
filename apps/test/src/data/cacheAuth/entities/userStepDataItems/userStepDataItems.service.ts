import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { CacheAuthUserStepDataItem } from './userStepDataItems.entity';

@Injectable()
export class CacheAuthUserStepDataItemsEntityService extends RedisEntityService<CacheAuthUserStepDataItem> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected repository: RedisRepositoryService<CacheAuthUserStepDataItem>,
    protected store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
