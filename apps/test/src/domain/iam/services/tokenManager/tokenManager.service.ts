import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMTokenManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import { DataCacheAuthToken } from '../../../../data/cacheAuth/entities/tokens/tokens.entity.js';
import { DomainIAMAuthenticationOktaService } from '../authenticationOkta/authenticationOkta.service.js';
import { DomainIAMAuthenticationPassthroughService } from '../authenticationPassthrough/authenticationPassthrough.service.js';
import { DomainIAMAuthenticationUserLocalService } from '../authenticationUserLocal/authenticationUserLocal.service.js';
import { DomainIAMTokensService } from '../tokens/tokens.service.js';

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
