import { Injectable } from '@nestjs/common';

import { DomainEntityService } from '@node-c/core';

import { CacheUser, CacheUsersEntityService } from '../../../../persistance/cache';

@Injectable()
export class DomainAdminUsersService extends DomainEntityService<CacheUser, CacheUsersEntityService> {
  constructor(protected persistanceEntityService: CacheUsersEntityService) {
    super(persistanceEntityService);
  }
}
