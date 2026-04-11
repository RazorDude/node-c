import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions';
import { DataCacheAuthToken } from '../../../../data/cacheAuth';
import { DomainIAMAuthenticationOktaService } from '../authenticationOkta';
import { DomainIAMAuthenticationPassthroughService } from '../authenticationPassthrough';
import { DomainIAMAuthenticationUserLocalService } from '../authenticationUserLocal';
import { DomainIAMTokensService } from '../tokens';

@Injectable()
export class DomainIAMTokenManagerService extends IAMTokenManagerService<DataCacheAuthToken> {
  constructor(
    protected authenticationOktaService: DomainIAMAuthenticationOktaService,
    protected authenticationPassthroughService: DomainIAMAuthenticationPassthroughService,
    protected authenticationUserLocalService: DomainIAMAuthenticationUserLocalService,
    configProvider: ConfigProviderService,
    domainTokensEntityService: DomainIAMTokensService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string
  ) {
    super(
      {
        [Constants.DOMAIN_IAM_AUTH_OKTA_SERVICE_NAME]: authenticationOktaService,
        [Constants.DOMAIN_IAM_AUTH_PASSTHROUGH_SERVICE_NAME]: authenticationPassthroughService,
        [Constants.DOMAIN_IAM_AUTH_USER_LOCAL_SERVICE_NAME]: authenticationUserLocalService
      },
      configProvider,
      logger,
      moduleName,
      domainTokensEntityService
    );
  }
}
