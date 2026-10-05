import { Inject, Injectable } from '@nestjs/common';

import {
  type ConfigProviderService,
  Constants as CoreConstants,
  type LoggerService
} from '@node-c/core';
import { IAMAuthenticationManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';

import type { DomainCoursePlatformFederatedAuthenticationOktaConsumerService } from '../authenticationOktaConsumer/authenticationOktaConsumer.service.js';
import type { DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer/authenticationUserLocalConsumer.service.js';
import type { DomainCoursePlatformFederatedTokenManagerService } from '../tokenManager/tokenManager.service.js';

@Injectable()
export class DomainCoursePlatformFederatedAuthenticationManagerService extends IAMAuthenticationManagerService {
  // biome-ignore lint/complexity/useMaxParams: DI.
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
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]:
          authenticationOktaConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]:
          authenticationUserLocalConsumerService
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
