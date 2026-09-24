import { Injectable } from '@nestjs/common';

import { DataDefaultData, DomainEntityService, DomainEntityServiceDefaultData, LoggerService } from '@node-c/core';

import { DataCacheFederatedToken } from '../../../../data/cacheFederated/entities/tokens/tokens.entity.js';
import { DataCacheFederatedTokensEntityService } from '../../../../data/cacheFederated/entities/tokens/tokens.service.js';

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
