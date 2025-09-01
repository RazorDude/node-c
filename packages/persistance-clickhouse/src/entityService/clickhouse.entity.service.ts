import { ConfigProviderService, GenericObject } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { ClickHouseDBEntitySchema, ClickHouseDBRepository } from '../repository';

export class ClickHouseDBEntityService<Entity extends GenericObject> extends RDBEntityService<Entity> {
  protected primaryKeys: string[];

  constructor(
    protected configProvider: ConfigProviderService,
    protected qb: SQLQueryBuilderService,
    protected repository: ClickHouseDBRepository<Entity>,
    protected schema: ClickHouseDBEntitySchema
  ) {
    super(configProvider, qb, repository, schema);
    this.primaryKeys = repository.primaryKeys;
  }
}
