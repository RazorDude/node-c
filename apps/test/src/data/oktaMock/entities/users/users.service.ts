import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import {
  TypeORMDBEntityService,
  TypeORMDBRepository
} from '@node-c/data-typeorm';

import { DataOktaMockUser, DataOktaMockUserEntity } from './users.entity.js';

@Injectable()
export class DataOktaMockUsersService extends TypeORMDBEntityService<DataOktaMockUser> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataOktaMockUser>
  ) {
    super(configProvider, logger, qb, repository, DataOktaMockUserEntity);
  }
}
