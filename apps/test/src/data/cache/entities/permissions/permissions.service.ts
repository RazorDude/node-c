import { Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { RedisEntityService, RedisRepositoryService, RedisStoreService } from '@node-c/data-redis';

import { DataCachePermission } from './permissions.entity';

@Injectable()
export class DataCachePermissionsEntityService extends RedisEntityService<DataCachePermission> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCachePermission>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
