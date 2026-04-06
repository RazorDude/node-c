import { Injectable } from '@nestjs/common';

import { DataDefaultData, DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { DataCacheFederatedToken, DataCacheFederatedTokensEntityService } from '../../../../data/cacheFederated';

@Injectable()
export class DomainCoursePlatformFederatedTokensService extends DomainEntityService<
  DataCacheFederatedToken,
  DataCacheFederatedTokensEntityService,
  DomainEntityServiceDefaultData<DataCacheFederatedToken>,
  undefined,
  DataDefaultData<DataCacheFederatedToken>
> {
  constructor(dataEntityService: DataCacheFederatedTokensEntityService, logger: LoggerService) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
