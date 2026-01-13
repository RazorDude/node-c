import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import {
  ConfigProviderService,
  Constants as CoreConstants,
  DomainMethod,
  DomainPersistanceEntityServiceType,
  PersistanceEntityService,
  PersistanceFindOneOptions
} from '@node-c/core';
import {
  IAMUsersService as BaseIAMUsersService,
  GetUserWithPermissionsDataOptions,
  UserAuthKnownType
} from '@node-c/domain-iam';

import { AuthorizationPoint, CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';
import { UsersService as DBUsersService } from '../../../../persistance/db';

import { IAMAuthenticationLocalService } from '../authenticationLocal';
import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMUsersService extends BaseIAMUsersService<CacheUser> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE;

  constructor(
    protected authenticationLocalService: IAMAuthenticationLocalService,
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected persistanceDBUsersService: DBUsersService,
    protected persistanceUsersService: CacheUsersEntityService,
    protected tokenManager: IAMTokenManagerService
  ) {
    super(
      configProvider,
      moduleName,
      persistanceUsersService,
      tokenManager,
      {
        [UserAuthKnownType.Local]: authenticationLocalService
      },
      [DomainMethod.FindOne],
      { db: persistanceDBUsersService as unknown as PersistanceEntityService<Partial<CacheUser>> }
    );
  }

  // TODO: caching by email
  async getUserWithPermissionsData(
    options: PersistanceFindOneOptions,
    privateOptions?: GetUserWithPermissionsDataOptions
  ): Promise<CacheUser | null> {
    const { keepPassword } = privateOptions || {};
    const include = [...(options.include || []), 'accountStatus', 'assignedUserTypes.authorizationPoints'];
    const { result: user } = await this.findOne(
      {
        ...options,
        include,
        ...(!!options.filters.id
          ? {
              persistanceServices: [DomainPersistanceEntityServiceType.Main, 'db'],
              saveAdditionalResultsInFirstService: { serviceName: 'db', useResultsForFirstService: true }
            }
          : { persistanceServices: ['db'] })
      },
      { withPassword: true }
    );
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
