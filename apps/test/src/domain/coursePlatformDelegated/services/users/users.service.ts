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

import { DataAuditUserLoginLog, DataAuditUserLoginLogsService } from '../../../../data/audit';
import { DataCacheUsersEntityService } from '../../../../data/cache';
import {
  DataDBUser,
  DataDBUsersCreateUserData,
  DataDBUsersService,
  DataDBUsersUpdateUserData
} from '../../../../data/db';

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
