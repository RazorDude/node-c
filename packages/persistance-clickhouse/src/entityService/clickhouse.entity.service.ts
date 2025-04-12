import { GenericObject } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { ClickHouseDBEntitySchema, ClickHouseDBRepository } from '../repository';

export class ClickHouseDBEntityService<Entity extends GenericObject> extends RDBEntityService<Entity> {
  protected primaryKeys: string[];

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected qb: SQLQueryBuilderService,
    // eslint-disable-next-line no-unused-vars
    protected repository: ClickHouseDBRepository<Entity>,
    protected schema: ClickHouseDBEntitySchema
  ) {
    super(qb, repository, schema);
    this.primaryKeys = repository.primaryKeys;
  }
}
