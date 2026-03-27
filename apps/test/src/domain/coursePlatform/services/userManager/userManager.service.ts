import { Inject, Injectable } from '@nestjs/common';

import {
  ConfigProviderService,
  Constants as CoreConstants,
  DataFindOneOptions,
  DomainDataEntityServiceType,
  DomainEntityServiceDefaultData,
  LoggerService
} from '@node-c/core';
import {
  AuthorizationPoint as BaseIAMAuthorizationPoint,
  IAMUserManagerGetUserWithPermissionsDataOptions,
  IAMUserManagerService
} from '@node-c/domain-iam';

import { Constants } from '../../../../common/definitions';

import { CacheUser } from '../../../../data/cache';
import { CacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth';
import { User as DBUser, UsersDataEntityServiceData as DBUsersDataEntityServiceData } from '../../../../data/db';

import { CoursePlatformAuthenticationOktaConsumerService } from '../authenticationOktaConsumer';
import { CoursePlatformAuthenticationUserLocalConsumerService } from '../authenticationUserLocalConsumer';
import { CoursePlatformTokenManagerService } from '../tokenManager';
import { CoursePlatformUsersService } from '../users';

@Injectable()
export class CoursePlatformUserManagerService extends IAMUserManagerService<
  DBUser,
  DomainEntityServiceDefaultData<DBUser>,
  DBUsersDataEntityServiceData<DBUser>
> {
  static injectionToken = Constants.DOMAIN_COURSE_PLATFORM_USER_MANAGER_SERVICE;

  constructor(
    protected authenticationOktaConsumerService: CoursePlatformAuthenticationOktaConsumerService,
    protected authenticationUserLocalConsumerService: CoursePlatformAuthenticationUserLocalConsumerService,
    configProvider: ConfigProviderService,
    protected dataUserStepDataItemsService: CacheAuthUserStepDataItemsEntityService,
    domainUsersEntityService: CoursePlatformUsersService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    tokenManager: CoursePlatformTokenManagerService
  ) {
    super(
      {
        oktaConsumer: authenticationOktaConsumerService,
        userLocalConsumer: authenticationUserLocalConsumerService
      },
      configProvider,
      dataUserStepDataItemsService,
      domainUsersEntityService,
      logger,
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
      assignedUserTypes.forEach((item, itemIndex) => {
        item.authorizationPoints?.forEach(ap => {
          const { controllerNames, handlerNames, moduleNames, ...apData } = ap;
          currentAuthorizationPoints[ap.id] = {
            ...apData,
            moduleName: moduleNames![0],
            resourceContext: controllerNames![0],
            resources: handlerNames
          };
        });
        delete user.assignedUserTypes![itemIndex].authorizationPoints;
      });
    }
    user.currentAuthorizationPoints = currentAuthorizationPoints;
    if (!keepPassword) {
      delete user.password;
    }
    return user as CacheUser;
  }
}
