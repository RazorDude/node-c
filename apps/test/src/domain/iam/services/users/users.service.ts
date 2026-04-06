import { Injectable } from '@nestjs/common';

import { DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, DomainDataEntityServiceType, LoggerService } from '@node-c/core';
import { IAMPermission, IAMUsersService } from '@node-c/domain-iam';

import {
  DomainIAMUsersDomainEntityServiceData,
  DomainIAMUsersGetUserWithPermissionsDataOptions,
  DomainIAMUsersGetUserWithPermissionsDataPrivateOptions
} from './users.definitions';

import { DataCacheUser, DataCacheUsersEntityService } from '../../../../data/cache';
import { DataDBUser, DataDBUsersDataEntityServiceData, DataDBUsersService } from '../../../../data/db';

@Injectable()
export class DomainIAMUsersService extends IAMUsersService<
  DataDBUser,
  DataDBUsersService,
  DomainIAMUsersDomainEntityServiceData<DataDBUser>,
  { cache: DataCacheUsersEntityService },
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  constructor(
    protected cacheUsersEntityService: DataCacheUsersEntityService,
    dataEntityService: DataDBUsersService,
    logger: LoggerService
  ) {
    super(dataEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, logger, { cache: cacheUsersEntityService });
  }

  // TODO: caching by email
  async getUserWithPermissionsData(
    options: DomainIAMUsersGetUserWithPermissionsDataOptions,
    privateOptions?: DomainIAMUsersGetUserWithPermissionsDataPrivateOptions
  ): Promise<DataCacheUser | null> {
    const { keepPassword } = privateOptions || {};
    const include = [...(options.include || []), 'accountStatus', 'assignedRoles.permissions'];
    const { result: user } = await this.findOne(
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
    const { assignedRoles } = user;
    const currentPermissions: { [id: string]: IAMPermission<number> } = {};
    if (assignedRoles) {
      assignedRoles.forEach((item, itemIndex) => {
        item.permissions?.forEach(pi => {
          currentPermissions[pi.id] = pi;
        });
        delete user.assignedRoles![itemIndex].permissions;
      });
    }
    user.currentPermissions = currentPermissions;
    if (!keepPassword) {
      delete user.password;
    }
    return user as DataCacheUser;
  }
}
