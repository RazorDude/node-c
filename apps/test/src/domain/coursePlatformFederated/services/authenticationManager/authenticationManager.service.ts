import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions';

import { DomainCoursePlatformFederatedAuthenticationOktaConsumerService } from '../authenticationOktaConsumer';
import { DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer';
import { DomainCoursePlatformFederatedTokenManagerService } from '../tokenManager';

@Injectable()
export class DomainCoursePlatformFederatedAuthenticationManagerService extends IAMAuthenticationManagerService {
  constructor(
    protected authenticationOktaConsumerService: DomainCoursePlatformFederatedAuthenticationOktaConsumerService,
    protected authenticationUserLocalConsumerService: DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService,
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    tokenManager: DomainCoursePlatformFederatedTokenManagerService
  ) {
    super(
      {
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]: authenticationOktaConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]: authenticationUserLocalConsumerService
      },
      configProvider,
      logger,
      moduleName,
      undefined,
      undefined,
      tokenManager
    );
  }
}
