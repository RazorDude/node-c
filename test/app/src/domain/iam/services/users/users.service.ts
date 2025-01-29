import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/common/configProvider';
import { Constants } from '@node-c/common/definitions';
import { IAMUsersService as BaseIAMUsersService } from '@node-c/domain/iam';

import { CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';

import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMUsersService extends BaseIAMUsersService<string, CacheUser> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE;

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(Constants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected persistanceUsersService: CacheUsersEntityService,
    @Inject(IAMTokenManagerService.injectionToken)
    protected tokenManager: IAMTokenManagerService
  ) {
    super(configProvider, moduleName, persistanceUsersService, tokenManager);
  }
}
