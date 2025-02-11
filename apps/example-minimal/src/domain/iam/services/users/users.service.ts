import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants } from '@node-c/core';
import { IAMUsersService as BaseIAMUsersService } from '@node-c/domain-iam';

import { CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';

import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMUsersService extends BaseIAMUsersService<string, CacheUser> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE;

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected persistanceUsersService: CacheUsersEntityService,
    protected tokenManager: IAMTokenManagerService
  ) {
    super(configProvider, moduleName, persistanceUsersService, tokenManager);
  }
}
