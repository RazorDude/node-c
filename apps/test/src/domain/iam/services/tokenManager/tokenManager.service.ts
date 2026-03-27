import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService, IAMAuthenticationType } from '@node-c/domain-iam';

import { CacheAuthToken } from '../../../../data/cacheAuth';
import { IAMAuthenticationOktaService } from '../authenticationOkta';
import { IAMAuthenticationPassthroughService } from '../authenticationPassthrough';
import { IAMAuthenticationUserLocalService } from '../authenticationUserLocal';
import { IAMTokensService } from '../tokens';

@Injectable()
export class IAMTokenManagerService extends BaseIAMTokenManagerService<CacheAuthToken> {
  static injectionToken = Constants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

  constructor(
    protected authenticationOktaService: IAMAuthenticationOktaService,
    protected authenticationPassthroughService: IAMAuthenticationPassthroughService,
    protected authenticationUserLocalService: IAMAuthenticationUserLocalService,
    configProvider: ConfigProviderService,
    domainTokensEntityService: IAMTokensService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string
  ) {
    super(
      {
        okta: authenticationOktaService,
        passthrough: authenticationPassthroughService,
        [IAMAuthenticationType.UserLocal]: authenticationUserLocalService
      },
      configProvider,
      domainTokensEntityService,
      logger,
      moduleName
    );
  }
}
