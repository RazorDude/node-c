import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  RedisEntityService,
  RedisRepositoryService,
  RedisStoreService
} from '@node-c/data-redis';

import type { DataCacheFederatedToken } from './tokens.entity.js';

@Injectable()
export class DataCacheFederatedTokensEntityService extends RedisEntityService<DataCacheFederatedToken> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    repository: RedisRepositoryService<DataCacheFederatedToken>,
    store: RedisStoreService
  ) {
    super(configProvider, logger, repository, store);
  }
}
