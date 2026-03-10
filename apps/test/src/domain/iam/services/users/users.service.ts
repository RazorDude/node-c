import { Injectable } from '@nestjs/common';

import { DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, DomainEntityService } from '@node-c/core';

import { IAMUsersDomainEntityServiceData } from './users.definitions';

import { CacheUsersEntityService } from '../../../../data/cache';
import {
  User as DBUser,
  UsersDataEntityServiceData as DBUsersDataEntityServiceData,
  UsersService as DBUsersEntityService
} from '../../../../data/db';

@Injectable()
export class IAMUsersService extends DomainEntityService<
  DBUser,
  DBUsersEntityService,
  IAMUsersDomainEntityServiceData<DBUser>,
  { cache: CacheUsersEntityService },
  DBUsersDataEntityServiceData<DBUser>
> {
  constructor(
    protected cacheUsersEntityService: CacheUsersEntityService,
    protected dataEntityService: DBUsersEntityService
  ) {
    super(dataEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, { cache: cacheUsersEntityService });
  }
}
