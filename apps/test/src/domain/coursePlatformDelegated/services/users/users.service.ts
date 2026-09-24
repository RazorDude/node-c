import { Injectable } from '@nestjs/common';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DataDefaultData,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOptions,
  DomainFindResult,
  LoggerService
} from '@node-c/core';

import { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.service.js';
import { DataCacheUsersEntityService } from '../../../../data/cache/entities/users/users.service.js';
import {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import { DataDBUsersService } from '../../../../data/db/entities/users/users.service.js';

@Injectable()
export class DomainCoursePlatformDelegatedUsersService extends DomainEntityService<
  DataDBUser,
  DataDBUsersService,
  DomainEntityServiceDefaultData<DataDBUser>,
  { cache: DataCacheUsersEntityService },
  DataDefaultData<DataDBUser> & { Create: DataDBUsersCreateUserData; Update: DataDBUsersUpdateUserData }
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected dataAuditUserLoginLogsService: DataAuditUserLoginLogsService,
    protected dataCacheUsersService: DataCacheUsersEntityService,
    dataEntityService: DataDBUsersService,
    logger: LoggerService
  ) {
    super(dataEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, logger, {
      cache: dataCacheUsersService
    });
  }

  async findLoginLogs(options: DomainFindOptions): Promise<DomainFindResult<DataAuditUserLoginLog>> {
    return { result: await this.dataAuditUserLoginLogsService.find(options) };
  }
}
