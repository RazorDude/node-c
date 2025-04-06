import { Inject, Injectable } from '@nestjs/common';

import { Constants, RDBEntityService, RDBRepository, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { GlobalConfigItem, GlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class GlobalConfigItemsService extends RDBEntityService<GlobalConfigItem> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: RDBRepository<GlobalConfigItem>
  ) {
    super(qb, repository, GlobalConfigItemEntity);
  }
}
