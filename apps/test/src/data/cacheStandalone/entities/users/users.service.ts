import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheStandaloneUser } from './users.entity.js';

@Injectable()
export class DataCacheStandaloneUsersEntityService extends RedisEntityService<DataCacheStandaloneUser> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheStandaloneUser>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
