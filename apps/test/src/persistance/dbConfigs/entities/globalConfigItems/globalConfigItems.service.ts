import { Inject, Injectable } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { TypeORMEntityService, TypeORMRepository } from '@node-c/persistance-typeorm';

import { GlobalConfigItem, GlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class GlobalConfigItemsService extends TypeORMEntityService<GlobalConfigItem> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMRepository<GlobalConfigItem>
  ) {
    super(qb, repository, GlobalConfigItemEntity);
  }
}
