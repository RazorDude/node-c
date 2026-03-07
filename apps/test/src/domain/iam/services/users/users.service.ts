import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import {
  ConfigProviderService,
  Constants as CoreConstants,
  DataEntityService,
  DataFindOneOptions,
  DomainDataEntityServiceType,
  DomainMethod
} from '@node-c/core';
import {
  AuthorizationPoint as BaseIAMAuthorizationPoint,
  IAMUsersService as BaseIAMUsersService,
  IAMAuthenticationType,
  IAMUsersGetUserWithPermissionsDataOptions
} from '@node-c/domain-iam';

import { CacheUser, CacheUsersEntityService } from '../../../../data/cache';
import { CacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth';
import { UsersService as DBUsersService } from '../../../../data/db';

import { IAMAuthenticationUserLocalService } from '../authenticationUserLocal';
import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMUsersService extends BaseIAMUsersService<CacheUser> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE;

  constructor(
    protected authenticationUserLocalService: IAMAuthenticationUserLocalService,
    protected configProvider: ConfigProviderService,
    protected dataDBUsersService: DBUsersService,
    protected dataEntityService: CacheUsersEntityService,
    protected dataUserStepDataItemsService: CacheAuthUserStepDataItemsEntityService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected tokenManager: IAMTokenManagerService
  ) {
    super(
      { [IAMAuthenticationType.UserLocal]: authenticationUserLocalService },
      configProvider,
      dataEntityService,
      dataUserStepDataItemsService,
      moduleName,
      tokenManager,
      [DomainMethod.FindOne],
      { db: dataDBUsersService as unknown as DataEntityService<Partial<CacheUser>> }
    );
  }

  // TODO: caching by email
  // TODO: permanently fix the naming of the controller & other fields to the new context scheme
  async getUserWithPermissionsData(
    options: DataFindOneOptions,
    privateOptions?: IAMUsersGetUserWithPermissionsDataOptions
  ): Promise<CacheUser | null> {
    const { keepPassword } = privateOptions || {};
    const include = [...(options.include || []), 'accountStatus', 'assignedUserTypes.authorizationPoints'];
    const { result: user } = await this.findOne(
      {
        ...options,
        include,
        ...(!!options.filters.id
          ? {
              dataServices: [DomainDataEntityServiceType.Main, 'db'],
              saveAdditionalResultsInFirstService: { serviceName: 'db', useResultsForFirstService: true }
            }
          : { dataServices: ['db'] })
      },
      { withPassword: true }
    );
    if (!user) {
      return null;
    }
    const { assignedUserTypes } = user;
    const currentAuthorizationPoints: { [id: string]: BaseIAMAuthorizationPoint<number> } = {};
    if (assignedUserTypes) {
      assignedUserTypes.forEach(item => {
        item.authorizationPoints?.forEach(ap => {
          const { controllerNames, handlerNames, moduleNames, ...apData } = ap;
          currentAuthorizationPoints[ap.id] = {
            ...apData,
            moduleName: moduleNames![0],
            resourceContext: controllerNames![0],
            resources: handlerNames
          };
        });
      });
    }
    user.currentAuthorizationPoints = currentAuthorizationPoints;
    if (!keepPassword) {
      delete user.password;
    }
    return user;
  }
}
