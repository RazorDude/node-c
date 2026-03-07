import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService, IAMAuthenticationType } from '@node-c/domain-iam';

import { CacheAuthToken, CacheAuthTokensEntityService } from '../../../../data/cacheAuth';
import { IAMAuthenticationUserLocalService } from '../authenticationUserLocal';

@Injectable()
export class IAMTokenManagerService extends BaseIAMTokenManagerService<CacheAuthToken> {
  static injectionToken = Constants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

  constructor(
    protected authenticationUserLocalService: IAMAuthenticationUserLocalService,
    protected configProvider: ConfigProviderService,
    protected dataEntityService: CacheAuthTokensEntityService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string
  ) {
    super(
      { [IAMAuthenticationType.UserLocal]: authenticationUserLocalService },
      configProvider,
      dataEntityService,
      moduleName
    );
  }
}
