import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import { DataCacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth/entities/userStepDataItems/userStepDataItems.service.js';
import { DataDBUsersDataEntityServiceData } from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';

import { DomainIAMAuthenticationOktaService } from '../authenticationOkta/authenticationOkta.service.js';
import { DomainIAMAuthenticationPassthroughService } from '../authenticationPassthrough/authenticationPassthrough.service.js';
import { DomainIAMAuthenticationUserLocalService } from '../authenticationUserLocal/authenticationUserLocal.service.js';
import { DomainIAMTokenManagerService } from '../tokenManager/tokenManager.service.js';
import { DomainIAMUsersDomainEntityServiceData } from '../users/users.definitions.js';
import { DomainIAMUsersService } from '../users/users.service.js';

@Injectable()
export class DomainIAMAuthenticationManagerService extends IAMAuthenticationManagerService<
  DataDBUser,
  DomainIAMUsersDomainEntityServiceData<DataDBUser>,
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  constructor(
    protected authenticationOktaService: DomainIAMAuthenticationOktaService,
    protected authenticationPassthroughService: DomainIAMAuthenticationPassthroughService,
    protected authenticationUserLocalService: DomainIAMAuthenticationUserLocalService,
    configProvider: ConfigProviderService,
    protected dataUserStepDataItemsService: DataCacheAuthUserStepDataItemsEntityService,
    domainUsersEntityService: DomainIAMUsersService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    tokenManager: DomainIAMTokenManagerService
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
      dataUserStepDataItemsService,
      domainUsersEntityService,
      tokenManager
    );
  }
}
