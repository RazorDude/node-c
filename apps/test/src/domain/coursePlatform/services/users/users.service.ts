import { Injectable } from '@nestjs/common';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOptions,
  DomainFindResult
} from '@node-c/core';

import { AuditUserLoginLogsService, UserLoginLog } from '../../../../persistance/audit';
import { CacheUsersEntityService } from '../../../../persistance/cache';
import { User as DBUser, UsersService as DBUsersService } from '../../../../persistance/db';

@Injectable()
export class CoursePlatformUsersService extends DomainEntityService<
  DBUser,
  DBUsersService,
  DomainEntityServiceDefaultData<DBUser>,
  { cache: CacheUsersEntityService }
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
