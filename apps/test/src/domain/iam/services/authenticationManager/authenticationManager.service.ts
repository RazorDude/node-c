import { Inject, Injectable } from '@nestjs/common';

import {
  type ConfigProviderService,
  Constants as CoreConstants,
  type LoggerService
} from '@node-c/core';
import { IAMAuthenticationManagerService } from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions/common.constants.js';
import type { DataCacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth/entities/userStepDataItems/userStepDataItems.service.js';
import type { DataDBUsersDataEntityServiceData } from '../../../../data/db/entities/users/users.definitions.js';
import type { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';

import type { DomainIAMAuthenticationOktaService } from '../authenticationOkta/authenticationOkta.service.js';
import type { DomainIAMAuthenticationPassthroughService } from '../authenticationPassthrough/authenticationPassthrough.service.js';
import type { DomainIAMAuthenticationUserLocalService } from '../authenticationUserLocal/authenticationUserLocal.service.js';
import type { DomainIAMTokenManagerService } from '../tokenManager/tokenManager.service.js';
import type { DomainIAMUsersDomainEntityServiceData } from '../users/users.definitions.js';
import type { DomainIAMUsersService } from '../users/users.service.js';

@Injectable()
export class DomainIAMAuthenticationManagerService extends IAMAuthenticationManagerService<
  DataDBUser,
  DomainIAMUsersDomainEntityServiceData<DataDBUser>,
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  // biome-ignore lint/complexity/useMaxParams: DI.
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
        [Constants.DOMAIN_IAM_AUTH_OKTA_SERVICE_NAME]:
          authenticationOktaService,
        [Constants.DOMAIN_IAM_AUTH_PASSTHROUGH_SERVICE_NAME]:
          authenticationPassthroughService,
        [Constants.DOMAIN_IAM_AUTH_USER_LOCAL_SERVICE_NAME]:
          authenticationUserLocalService
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
