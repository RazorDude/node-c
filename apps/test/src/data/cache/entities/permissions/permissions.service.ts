import { Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  RedisEntityService,
  type RedisRepositoryService,
  type RedisStoreService
} from '@node-c/data-redis';

import type { DataCachePermission } from './permissions.entity.js';

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
