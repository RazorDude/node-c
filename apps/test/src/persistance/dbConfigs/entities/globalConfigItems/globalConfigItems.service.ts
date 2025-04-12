import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/persistance-typeorm';

import { GlobalConfigItem, GlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class GlobalConfigItemsService extends TypeORMDBEntityService<GlobalConfigItem> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<GlobalConfigItem>
  ) {
    super(qb, repository, GlobalConfigItemEntity);
  }
}
