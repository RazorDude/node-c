import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions';
import { DataCacheAuthToken } from '../../../../data/cacheAuth';
import { DomainCoursePlatformFederatedAuthenticationOktaConsumerService } from '../authenticationOktaConsumer';
import { DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer';
import { DomainCoursePlatformFederatedTokensService } from '../tokens';

@Injectable()
export class DomainCoursePlatformFederatedTokenManagerService extends IAMTokenManagerService<DataCacheAuthToken> {
  constructor(
    protected authenticationOktaConsumerService: DomainCoursePlatformFederatedAuthenticationOktaConsumerService,
    protected authenticationUserLocalConsumerService: DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService,
    configProvider: ConfigProviderService,
    domainTokensEntityService: DomainCoursePlatformFederatedTokensService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string
  ) {
    super(
      {
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]: authenticationOktaConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]: authenticationUserLocalConsumerService
      },
      configProvider,
      logger,
      moduleName,
      domainTokensEntityService
    );
  }
}
