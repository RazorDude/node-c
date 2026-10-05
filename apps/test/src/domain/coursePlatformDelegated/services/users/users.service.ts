import { Injectable } from '@nestjs/common';

import {
  type DataDefaultData,
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainEntityService,
  type DomainEntityServiceDefaultData,
  type DomainFindOptions,
  type DomainFindResult,
  type LoggerService
} from '@node-c/core';

import type { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
import type { DataAuditUserLoginLogsService } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.service.js';
import type { DataCacheUsersEntityService } from '../../../../data/cache/entities/users/users.service.js';
import type {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import type { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import type { DataDBUsersService } from '../../../../data/db/entities/users/users.service.js';

@Injectable()
export class DomainCoursePlatformDelegatedUsersService extends DomainEntityService<
  DataDBUser,
  DataDBUsersService,
  DomainEntityServiceDefaultData<DataDBUser>,
  { cache: DataCacheUsersEntityService },
  DataDefaultData<DataDBUser> & {
    Create: DataDBUsersCreateUserData;
    Update: DataDBUsersUpdateUserData;
  }
> {
  constructor(
    protected dataAuditUserLoginLogsService: DataAuditUserLoginLogsService,
    protected dataCacheUsersService: DataCacheUsersEntityService,
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
}
