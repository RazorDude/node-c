import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import { DataCacheStandaloneToken } from '../../../../data/cacheStandalone/entities/tokens/tokens.entity.js';
import { DomainCoursePlatformStandaloneAuthenticationOktaService } from '../authenticationOkta/authenticationOkta.service.js';
import { CoursePlatformStandaloneAuthenticationPassthroughConsumerService } from '../authenticationPassthroughConsumer/authenticationPassthroughConsumer.service.js';
import { DomainCoursePlatformStandaloneAuthenticationUserLocalService } from '../authenticationUserLocal/authenticationUserLocal.service.js';
import { DomainCoursePlatformStandaloneTokensService } from '../tokens/tokens.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneTokenManagerService extends BaseIAMTokenManagerService<DataCacheStandaloneToken> {
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
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]: authenticationOktaService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME]:
          authenticationPassthroughConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]: authenticationUserLocalService
      },
      configProvider,
      logger,
      moduleName,
      domainTokensEntityService
    );
  }
}
