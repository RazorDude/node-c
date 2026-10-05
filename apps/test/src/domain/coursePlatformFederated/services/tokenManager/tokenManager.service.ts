import { Inject, Injectable } from '@nestjs/common';

import {
  type ConfigProviderService,
  Constants as CoreConstants,
  type LoggerService
} from '@node-c/core';
import { IAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import type { DataCacheAuthToken } from '../../../../data/cacheAuth/entities/tokens/tokens.entity.js';
import type { DomainCoursePlatformFederatedAuthenticationOktaConsumerService } from '../authenticationOktaConsumer/authenticationOktaConsumer.service.js';
import type { DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer/authenticationUserLocalConsumer.service.js';
import type { DomainCoursePlatformFederatedTokensService } from '../tokens/tokens.service.js';

@Injectable()
export class DomainCoursePlatformFederatedTokenManagerService extends IAMTokenManagerService<DataCacheAuthToken> {
  // biome-ignore lint/complexity/useMaxParams: DI.
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
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]:
          authenticationOktaConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]:
          authenticationUserLocalConsumerService
      },
      configProvider,
      logger,
      moduleName,
      domainTokensEntityService
    );
  }
}
