import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import { ConfigProviderService, Constants as CoreConstants, PersistanceFindOneOptions } from '@node-c/core';
import {
  IAMUsersService as BaseIAMUsersService,
  GetUserWithPermissionsDataOptions,
  UserAuthKnownType
} from '@node-c/domain-iam';

import { AuthorizationPoint, CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';

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

  async getUserWithPermissionsData(
    options: PersistanceFindOneOptions,
    privateOptions?: GetUserWithPermissionsDataOptions
  ): Promise<CacheUser | null> {
    const { keepPassword } = privateOptions || {};
    const include = [...(options.include || []), 'accountStatus', 'assignedUserTypes.authorizationPoints'];
    // const user = await this.persistanceUsersService.findOne({ ...options, include });
    // const user = await this.persistanceUsersService.findOne(options);
    const { result: user } = await this.findOne({ ...options, include });
    if (!user) {
      return null;
    }
    const { assignedUserTypes } = user;
    const currentAuthorizationPoints: { [id: string]: AuthorizationPoint } = {};
    if (assignedUserTypes) {
      assignedUserTypes.forEach(item => {
        item.authorizationPoints?.forEach(ap => (currentAuthorizationPoints[ap.id] = ap as AuthorizationPoint));
      });
    }
    user.currentAuthorizationPoints = currentAuthorizationPoints;
    if (!keepPassword) {
      delete user.password;
    }
    return user;
  }
}
