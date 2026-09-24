import { Injectable } from '@nestjs/common';

import { DataDefaultData, DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { DataCacheAuthToken } from '../../../../data/cacheAuth/entities/tokens/tokens.entity.js';
import { DataCacheAuthTokensEntityService } from '../../../../data/cacheAuth/entities/tokens/tokens.service.js';

@Injectable()
export class DomainIAMTokensService extends DomainEntityService<
  DataCacheAuthToken,
  DataCacheAuthTokensEntityService,
  DomainEntityServiceDefaultData<DataCacheAuthToken>,
  undefined,
  DataDefaultData<DataCacheAuthToken>
> {
  constructor(dataEntityService: DataCacheAuthTokensEntityService, logger: LoggerService) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
