import { Injectable } from '@nestjs/common';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainDataEntityServiceType,
  DomainEntityService,
  type DomainFindOptions,
  type DomainFindResult,
  type LoggerService
} from '@node-c/core';
import type { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
import type { DataAuditUserLoginLogsService } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.service.js';
import type { DataCacheStandaloneUser } from '../../../../data/cacheStandalone/entities/users/users.entity.js';
import type { DataCacheStandaloneUsersEntityService } from '../../../../data/cacheStandalone/entities/users/users.service.js';
import type { DataDBUsersDataEntityServiceData } from '../../../../data/db/entities/users/users.definitions.js';
import type { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import type { DataDBUsersService } from '../../../../data/db/entities/users/users.service.js';

import type {
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
    protected dataAuditUserLoginLogsService: DataAuditUserLoginLogsService,
    protected dataCacheUsersService: DataCacheStandaloneUsersEntityService,
    dataEntityService: DataDBUsersService,
    logger: LoggerService
  ) {
    super(dataEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, logger, {
      cache: dataCacheUsersService
    });
  }

  async findLoginLogs(
    options: DomainFindOptions
  ): Promise<DomainFindResult<DataAuditUserLoginLog>> {
    return { result: await this.dataAuditUserLoginLogsService.find(options) };
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
    user.currentPermissions = {};
    if (!keepPassword) {
      user.password = undefined;
    }
    return user as DataCacheStandaloneUser;
  }
}
