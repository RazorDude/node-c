import { Injectable } from '@nestjs/common';

import type {
  DataDefaultData,
  DomainEntityServiceDefaultData
} from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { DomainEntityService, LoggerService } from '@node-c/core';

import type { DataCacheAuthToken } from '../../../../data/cacheAuth/entities/tokens/tokens.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DataCacheAuthTokensEntityService } from '../../../../data/cacheAuth/entities/tokens/tokens.service.js';

@Injectable()
export class DomainIAMTokensService extends DomainEntityService<
  DataCacheAuthToken,
  DataCacheAuthTokensEntityService,
  DomainEntityServiceDefaultData<DataCacheAuthToken>,
  undefined,
  DataDefaultData<DataCacheAuthToken>
> {
  constructor(
    dataEntityService: DataCacheAuthTokensEntityService,
    logger: LoggerService
  ) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
