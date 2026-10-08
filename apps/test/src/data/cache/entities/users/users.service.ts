import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheUser } from './users.entity.js';

@Injectable()
export class DataCacheUsersEntityService extends RedisEntityService<DataCacheUser> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheUser>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
