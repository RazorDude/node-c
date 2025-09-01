import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { GlobalConfigItem, GlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class GlobalConfigItemsService extends TypeORMDBEntityService<GlobalConfigItem> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<GlobalConfigItem>
  ) {
    super(configProvider, qb, repository, GlobalConfigItemEntity);
  }
}
