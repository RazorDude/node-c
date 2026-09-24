import { Injectable } from '@nestjs/common';

import { DataDefaultData, DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { DataCacheStandaloneToken } from '../../../../data/cacheStandalone/entities/tokens/tokens.entity.js';
import { DataCacheStandaloneTokensEntityService } from '../../../../data/cacheStandalone/entities/tokens/tokens.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneTokensService extends DomainEntityService<
  DataCacheStandaloneToken,
  DataCacheStandaloneTokensEntityService,
  DomainEntityServiceDefaultData<DataCacheStandaloneToken>,
  undefined,
  DataDefaultData<DataCacheStandaloneToken>
> {
  constructor(dataEntityService: DataCacheStandaloneTokensEntityService, logger: LoggerService) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
