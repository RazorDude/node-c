import { Injectable } from '@nestjs/common';

import { DataDefaultData, DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { CacheToken, CacheTokensEntityService } from '../../../../data/cache';

@Injectable()
export class CoursePlatformTokensService extends DomainEntityService<
  CacheToken,
  CacheTokensEntityService,
  DomainEntityServiceDefaultData<CacheToken>,
  undefined,
  DataDefaultData<CacheToken>
> {
  constructor(dataEntityService: CacheTokensEntityService, logger: LoggerService) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
