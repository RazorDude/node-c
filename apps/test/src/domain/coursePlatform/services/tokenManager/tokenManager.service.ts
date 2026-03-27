import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService } from '@node-c/domain-iam';

import { CacheAuthToken } from '../../../../data/cacheAuth';
import { CoursePlatformAuthenticationOktaConsumerService } from '../authenticationOktaConsumer';
import { CoursePlatformAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer';
import { CoursePlatformTokensService } from '../tokens';

@Injectable()
export class CoursePlatformTokenManagerService extends BaseIAMTokenManagerService<CacheAuthToken> {
  static injectionToken = Constants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

  constructor(
    protected authenticationOktaConsumerService: CoursePlatformAuthenticationOktaConsumerService,
    protected authenticationUserLocalConsumerService: CoursePlatformAuthenticationUserLocalConsumerService,
    configProvider: ConfigProviderService,
    domainTokensEntityService: CoursePlatformTokensService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string
  ) {
    super(
      {
        oktaConsumer: authenticationOktaConsumerService,
        userLocalConsumer: authenticationUserLocalConsumerService
      },
      configProvider,
      domainTokensEntityService,
      logger,
      moduleName
    );
  }
}
