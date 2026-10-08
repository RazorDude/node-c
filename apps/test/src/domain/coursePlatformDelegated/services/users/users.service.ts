import { Injectable } from '@nestjs/common';

import type {
  DataDefaultData,
  DomainEntityServiceDefaultData,
  DomainFindOptions,
  DomainFindResult
} from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainEntityService,
  LoggerService
} from '@node-c/core';

import type { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.service.js';
// biome-ignore lint/style/useImportType: DI.
import { DataCacheUsersEntityService } from '../../../../data/cache/entities/users/users.service.js';
import type {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import type { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DataDBUsersService } from '../../../../data/db/entities/users/users.service.js';

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
