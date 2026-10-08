import { Inject, Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import {
  ConfigProviderService,
  Constants as CoreConstants,
  LoggerService
} from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import type { DataCacheStandaloneToken } from '../../../../data/cacheStandalone/entities/tokens/tokens.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneAuthenticationOktaService } from '../authenticationOkta/authenticationOkta.service.js';
// biome-ignore lint/style/useImportType: DI.
import { CoursePlatformStandaloneAuthenticationPassthroughConsumerService } from '../authenticationPassthroughConsumer/authenticationPassthroughConsumer.service.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneAuthenticationUserLocalService } from '../authenticationUserLocal/authenticationUserLocal.service.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneTokensService } from '../tokens/tokens.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneTokenManagerService extends BaseIAMTokenManagerService<DataCacheStandaloneToken> {
  // biome-ignore lint/complexity/useMaxParams: DI.
  constructor(
    protected authenticationOktaService: DomainCoursePlatformStandaloneAuthenticationOktaService,
    protected authenticationPassthroughConsumerService: CoursePlatformStandaloneAuthenticationPassthroughConsumerService,
    protected authenticationUserLocalService: DomainCoursePlatformStandaloneAuthenticationUserLocalService,
    configProvider: ConfigProviderService,
    domainTokensEntityService: DomainCoursePlatformStandaloneTokensService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string
  ) {
    super(
      {
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]:
          authenticationOktaService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME]:
          authenticationPassthroughConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]:
          authenticationUserLocalService
      },
      configProvider,
      logger,
      moduleName,
      domainTokensEntityService
    );
  }
}
