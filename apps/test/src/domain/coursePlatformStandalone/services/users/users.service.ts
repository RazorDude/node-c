import { Injectable } from '@nestjs/common';
import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainDataEntityServiceType,
  DomainEntityService,
  LoggerService
} from '@node-c/core';

import { DataCacheStandaloneUser } from '../../../../data/cacheStandalone/entities/users/users.entity.js';
import { DataCacheStandaloneUsersEntityService } from '../../../../data/cacheStandalone/entities/users/users.service.js';
import { DataDBUsersDataEntityServiceData } from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import { DataDBUsersService } from '../../../../data/db/entities/users/users.service.js';

import {
  DomainCoursePlatformStandaloneUsersGetUserWithPermissionsDataOptions,
  DomainCoursePlatformStandaloneUsersGetUserWithPermissionsDataPrivateOptions,
  DomainCoursePlatformStandaloneUsersServiceData
} from './users.definitions.js';

@Injectable()
export class DomainCoursePlatformStandaloneUsersService extends DomainEntityService<
  DataDBUser,
  DataDBUsersService,
  DomainCoursePlatformStandaloneUsersServiceData<DataDBUser>,
  { cache: DataCacheStandaloneUsersEntityService },
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  constructor(
    protected dataCacheUsersService: DataCacheStandaloneUsersEntityService,
    dataEntityService: DataDBUsersService,
    logger: LoggerService
  ) {
    super(dataEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, logger, {
      cache: dataCacheUsersService
    });
  }

  // TODO: caching by email
  async getUserWithPermissionsData(
    options: DomainCoursePlatformStandaloneUsersGetUserWithPermissionsDataOptions,
    privateOptions?: DomainCoursePlatformStandaloneUsersGetUserWithPermissionsDataPrivateOptions
  ): Promise<DataCacheStandaloneUser | null> {
    const { keepPassword } = privateOptions || {};
    const include = [...(options.include || []), 'accountStatus'];
    const { result: user } = await this.findOne(
      {
        ...options,
        include,
        ...(options.filters.id
          ? {
              dataServices: ['cache', DomainDataEntityServiceType.Main],
              saveAdditionalResultsInFirstService: {
                serviceName: DomainDataEntityServiceType.Main,
                useResultsForFirstServiceReturnData: true
              }
            }
          : { dataServices: ['cache'] })
      },
      { withPassword: true }
    );
    if (!user) {
      return null;
    }
    user.currentPermissions = {};
    if (!keepPassword) {
      user.password = undefined;
    }
    return user as DataCacheStandaloneUser;
  }
}
