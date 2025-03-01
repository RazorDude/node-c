import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { GlobalConfigItem, GlobalConfigItemEntity } from './globalConfigItems.entity';

@Injectable()
export class GlobalConfigItemsService extends RDBEntityService<GlobalConfigItem> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(GlobalConfigItemEntity)
    repository: Repository<GlobalConfigItem>
  ) {
    super(qb, repository, GlobalConfigItemEntity);
  }
}
