import { Injectable } from '@nestjs/common';

import type {
  DataDefaultData,
  DomainEntityServiceDefaultData
} from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { DomainEntityService, LoggerService } from '@node-c/core';

import type { DataCacheStandaloneToken } from '../../../../data/cacheStandalone/entities/tokens/tokens.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DataCacheStandaloneTokensEntityService } from '../../../../data/cacheStandalone/entities/tokens/tokens.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneTokensService extends DomainEntityService<
  DataCacheStandaloneToken,
  DataCacheStandaloneTokensEntityService,
  DomainEntityServiceDefaultData<DataCacheStandaloneToken>,
  undefined,
  DataDefaultData<DataCacheStandaloneToken>
> {
  constructor(
    dataEntityService: DataCacheStandaloneTokensEntityService,
    logger: LoggerService
  ) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
