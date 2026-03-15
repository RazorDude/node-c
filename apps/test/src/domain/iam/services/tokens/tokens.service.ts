import { Injectable } from '@nestjs/common';

import { DataDefaultData, DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { CacheAuthToken, CacheAuthTokensEntityService } from '../../../../data/cacheAuth';

@Injectable()
export class IAMTokensService extends DomainEntityService<
  CacheAuthToken,
  CacheAuthTokensEntityService,
  DomainEntityServiceDefaultData<CacheAuthToken>,
  undefined,
  DataDefaultData<CacheAuthToken>
> {
  constructor(
    protected dataEntityService: CacheAuthTokensEntityService,
    protected logger: LoggerService
  ) {
    super(dataEntityService, ['create', 'delete'], logger);
  }
}
