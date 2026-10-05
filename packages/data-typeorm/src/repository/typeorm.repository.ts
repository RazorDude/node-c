import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/data-rdb';
import type { EntityTarget } from 'typeorm';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class TypeORMDBRepository<
  Entity extends ObjectLiteral
> extends Repository<Entity> {
  constructor(
    @Inject(Constants.RDB_REPOSITORY_DATASOURCE)
    protected dataSource: DataSource,
    @Inject(Constants.RDB_REPOSITORY_ENTITY_CLASS)
    protected entityClass: EntityTarget<Entity>
  ) {
    super(entityClass, dataSource.createEntityManager());
  }
}
