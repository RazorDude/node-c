import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService, IAMAuthenticationType } from '@node-c/domain-iam';

import { CacheAuthToken } from '../../../../data/cacheAuth';
import { IAMAuthenticationOktaService } from '../authenticationOkta';
import { IAMAuthenticationUserLocalService } from '../authenticationUserLocal';
import { IAMTokensService } from '../tokens';

@Injectable()
export class IAMTokenManagerService extends BaseIAMTokenManagerService<CacheAuthToken> {
  static injectionToken = Constants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

  constructor(
    protected authenticationOktaService: IAMAuthenticationOktaService,
    protected authenticationUserLocalService: IAMAuthenticationUserLocalService,
    protected configProvider: ConfigProviderService,
    protected domainTokensEntityService: IAMTokensService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string
  ) {
    super(
      { okta: authenticationOktaService, [IAMAuthenticationType.UserLocal]: authenticationUserLocalService },
      configProvider,
      domainTokensEntityService,
      moduleName
    );
  }
}
