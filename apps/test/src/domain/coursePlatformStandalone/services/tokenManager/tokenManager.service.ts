import { Inject, Injectable } from '@nestjs/common';

import { Constants as ApiHTTPConstants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService as BaseIAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions';
import { DataCacheStandaloneToken } from '../../../../data/cacheStandalone';
import { DomainCoursePlatformStandaloneAuthenticationOktaService } from '../authenticationOkta';
import { CoursePlatformStandaloneAuthenticationPassthroughConsumerService } from '../authenticationPassthroughConsumer';
import { DomainCoursePlatformStandaloneAuthenticationUserLocalService } from '../authenticationUserLocal';
import { DomainCoursePlatformStandaloneTokensService } from '../tokens';

@Injectable()
export class DomainCoursePlatformStandaloneTokenManagerService extends BaseIAMTokenManagerService<DataCacheStandaloneToken> {
  static injectionToken = ApiHTTPConstants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

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
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_SERVICE_NAME]: authenticationPassthroughConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]: authenticationUserLocalService
      },
      configProvider,
      logger,
      moduleName,
      domainTokensEntityService
    );
  }
}
