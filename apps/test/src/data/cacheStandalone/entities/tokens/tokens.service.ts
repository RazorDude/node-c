import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheStandaloneToken } from './tokens.entity.js';

@Injectable()
export class DataCacheStandaloneTokensEntityService extends RedisEntityService<DataCacheStandaloneToken> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheStandaloneToken>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
