import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions';
import { DataCacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth';
import { DataDBUser, DataDBUsersDataEntityServiceData } from '../../../../data/db';

import { DomainIAMAuthenticationOktaService } from '../authenticationOkta';
import { DomainIAMAuthenticationPassthroughService } from '../authenticationPassthrough';
import { DomainIAMAuthenticationUserLocalService } from '../authenticationUserLocal';
import { DomainIAMTokenManagerService } from '../tokenManager';
import { DomainIAMUsersDomainEntityServiceData, DomainIAMUsersService } from '../users';

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
