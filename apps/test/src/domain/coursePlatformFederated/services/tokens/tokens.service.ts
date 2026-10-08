import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import {
  type DataDefaultData,
  DomainEntityService,
  type DomainEntityServiceDefaultData,
  LoggerService
} from '@node-c/core';

import type { DataCacheFederatedToken } from '../../../../data/cacheFederated/entities/tokens/tokens.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DataCacheFederatedTokensEntityService } from '../../../../data/cacheFederated/entities/tokens/tokens.service.js';

@Injectable()
export class DomainCoursePlatformFederatedTokensService extends DomainEntityService<
  DataCacheFederatedToken,
  DataCacheFederatedTokensEntityService,
  DomainEntityServiceDefaultData<DataCacheFederatedToken>,
  undefined,
  DataDefaultData<DataCacheFederatedToken>
> {
  constructor(
    dataEntityService: DataCacheFederatedTokensEntityService,
    logger: LoggerService
  ) {
    super(dataEntityService, ['create', 'findOne', 'delete'], logger);
  }
}
