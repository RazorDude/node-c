import { Injectable } from '@nestjs/common';

import { DomainPersistanceEntityService } from '@node-c/core';

import { CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';

@Injectable()
export class DomainAdminUsersService extends DomainPersistanceEntityService<CacheUser, CacheUsersEntityService> {
  constructor(protected persistanceEntityService: CacheUsersEntityService) {
    super(persistanceEntityService);
  }
}
