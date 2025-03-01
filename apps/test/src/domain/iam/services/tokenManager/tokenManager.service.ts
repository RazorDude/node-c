import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService } from '@node-c/domain-iam';

import { CacheAuthToken, CacheAuthTokensEntityService } from '../../../../persistance/cacheAuth';

@Injectable()
export class IAMTokenManagerService extends BaseIAMTokenManagerService<CacheAuthToken, unknown, unknown> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected persistanceTokensService: CacheAuthTokensEntityService
  ) {
    super(configProvider, moduleName, persistanceTokensService);
  }
}
