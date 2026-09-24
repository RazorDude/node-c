import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import { DataCacheAuthToken } from '../../../../data/cacheAuth/entities/tokens/tokens.entity.js';
import { DomainCoursePlatformFederatedAuthenticationOktaConsumerService } from '../authenticationOktaConsumer/authenticationOktaConsumer.service.js';
import { DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer/authenticationUserLocalConsumer.service.js';
import { DomainCoursePlatformFederatedTokensService } from '../tokens/tokens.service.js';

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
