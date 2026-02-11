import { Injectable } from '@nestjs/common';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DataDefaultData,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOptions,
  DomainFindResult
} from '@node-c/core';

import { AuditUserLoginLogsService, UserLoginLog } from '../../../../data/audit';
import { CacheUsersEntityService } from '../../../../data/cache';
import {
  User as DBUser,
  UsersService as DBUsersService,
  UsersCreateUserData,
  UsersUpdateUserData
} from '../../../../data/db';

@Injectable()
export class CoursePlatformUsersService extends DomainEntityService<
  DBUser,
  DBUsersService,
  DomainEntityServiceDefaultData<DBUser>,
  { cache: CacheUsersEntityService },
  DataDefaultData<DBUser> & { Create: UsersCreateUserData; Update: UsersUpdateUserData }
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected dataAuditUserLoginLogsService: AuditUserLoginLogsService,
    protected dataCacheUsersService: CacheUsersEntityService,
    protected dataEntityService: DBUsersService
  ) {
    super(dataEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, {
      cache: dataCacheUsersService
    });
  }

  async findLoginLogs(options: DomainFindOptions): Promise<DomainFindResult<UserLoginLog>> {
    return { result: await this.dataAuditUserLoginLogsService.find(options) };
  }
}
