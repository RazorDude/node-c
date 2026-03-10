import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/api-http';
import {
  ConfigProviderService,
  Constants as CoreConstants,
  DataFindOneOptions,
  DomainDataEntityServiceType
} from '@node-c/core';
import {
  AuthorizationPoint as BaseIAMAuthorizationPoint,
  IAMUserManagerService as BaseIAMUserManagerService,
  IAMAuthenticationType,
  IAMUserManagerGetUserWithPermissionsDataOptions
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';
import { CacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth';
import { User as DBUser, UsersDataEntityServiceData as DBUsersDataEntityServiceData } from '../../../../data/db';

import { IAMAuthenticationOktaService } from '../authenticationOkta';
import { IAMAuthenticationUserLocalService } from '../authenticationUserLocal';
import { IAMTokenManagerService } from '../tokenManager';
import { IAMUsersDomainEntityServiceData, IAMUsersService } from '../users';

@Injectable()
export class IAMUserManagerService extends BaseIAMUserManagerService<
  DBUser,
  IAMUsersDomainEntityServiceData<DBUser>,
  DBUsersDataEntityServiceData<DBUser>
> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE;

  constructor(
    protected authenticationOktaService: IAMAuthenticationOktaService,
    protected authenticationUserLocalService: IAMAuthenticationUserLocalService,
    protected configProvider: ConfigProviderService,
    protected dataUserStepDataItemsService: CacheAuthUserStepDataItemsEntityService,
    protected domainUsersEntityService: IAMUsersService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected tokenManager: IAMTokenManagerService
  ) {
    super(
      { okta: authenticationOktaService, [IAMAuthenticationType.UserLocal]: authenticationUserLocalService },
      configProvider,
      dataUserStepDataItemsService,
      domainUsersEntityService,
      moduleName,
      tokenManager
    );
  }

  // TODO: caching by email
  // TODO: permanently fix the naming of the controller & other fields to the new context scheme
  async getUserWithPermissionsData(
    options: DataFindOneOptions,
    privateOptions?: IAMUserManagerGetUserWithPermissionsDataOptions
  ): Promise<CacheUser | null> {
    const { keepPassword } = privateOptions || {};
    const include = [...(options.include || []), 'accountStatus', 'assignedUserTypes.authorizationPoints'];
    const { result: user } = await this.domainUsersEntityService.findOne(
      {
        ...options,
        include,
        ...(!!options.filters.id
          ? {
              dataServices: ['cache', DomainDataEntityServiceType.Main],
              saveAdditionalResultsInFirstService: {
                serviceName: DomainDataEntityServiceType.Main,
                useResultsForFirstService: true
              }
            }
          : { dataServices: ['cache'] })
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
    return user as CacheUser;
  }
}
