import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
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
