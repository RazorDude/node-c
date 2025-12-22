import { Injectable } from '@nestjs/common';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOptions,
  DomainFindResult,
  PersistanceDefaultData
} from '@node-c/core';

import { AuditUserLoginLogsService, UserLoginLog } from '../../../../persistance/audit';
import { CacheUsersEntityService } from '../../../../persistance/cache';
import {
  User as DBUser,
  UsersService as DBUsersService,
  UsersCreateUserData,
  UsersUpdateUserData
} from '../../../../persistance/db';

@Injectable()
export class CoursePlatformUsersService extends DomainEntityService<
  DBUser,
  DBUsersService,
  DomainEntityServiceDefaultData<DBUser>,
  { cache: CacheUsersEntityService },
  PersistanceDefaultData<DBUser> & { Create: UsersCreateUserData; Update: UsersUpdateUserData }
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected persistanceAuditUserLoginLogsService: AuditUserLoginLogsService,
    protected persistanceCacheUsersService: CacheUsersEntityService,
    protected persistanceEntityService: DBUsersService
  ) {
    super(persistanceEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, {
      cache: persistanceCacheUsersService
    });
  }

  async findLoginLogs(options: DomainFindOptions): Promise<DomainFindResult<UserLoginLog>> {
    return { result: await this.persistanceAuditUserLoginLogsService.find(options) };
  }
}
