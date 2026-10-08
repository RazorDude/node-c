import { Inject, Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import {
  ConfigProviderService,
  Constants as CoreConstants,
  LoggerService
} from '@node-c/core';
import { IAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import type { DataCacheAuthToken } from '../../../../data/cacheAuth/entities/tokens/tokens.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformFederatedAuthenticationOktaConsumerService } from '../authenticationOktaConsumer/authenticationOktaConsumer.service.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformFederatedAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer/authenticationUserLocalConsumer.service.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformFederatedTokensService } from '../tokens/tokens.service.js';

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
