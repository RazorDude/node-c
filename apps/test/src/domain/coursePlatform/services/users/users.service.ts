import { Injectable } from '@nestjs/common';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainEntityService,
  DomainEntityServiceDefaultData
} from '@node-c/core';

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
    protected persistanceCacheUsersService: CacheUsersEntityService,
    protected persistanceEntityService: DBUsersService
  ) {
    super(persistanceEntityService, DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS, {
      cache: persistanceCacheUsersService
    });
  }
}
