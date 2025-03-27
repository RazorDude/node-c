import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants } from '@node-c/core';
import { IAMUsersService as BaseIAMUsersService, UserAuthKnownType } from '@node-c/domain-iam';

import { CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';

import { IAMAuthenticationLocalService } from '../authenticationLocal';
import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMUsersService extends BaseIAMUsersService<CacheUser> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE;

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected persistanceUsersService: CacheUsersEntityService,
    protected tokenManager: IAMTokenManagerService,
    protected authenticationLocalService: IAMAuthenticationLocalService
  ) {
    super(configProvider, moduleName, persistanceUsersService, tokenManager, {
      [UserAuthKnownType.Local]: authenticationLocalService
    });
  }
}
