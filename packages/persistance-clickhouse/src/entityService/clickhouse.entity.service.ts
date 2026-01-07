import { ConfigProviderService, GenericObject, PersistanceDefaultData } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { ClickHouseDBEntitySchema, ClickHouseDBRepository } from '../repository';

export class ClickHouseDBEntityService<
  Entity extends GenericObject,
  Data extends PersistanceDefaultData<Entity> = PersistanceDefaultData<Entity>
> extends RDBEntityService<Entity, Data> {
  protected primaryKeys: string[];

  constructor(
    protected configProvider: ConfigProviderService,
    protected qb: SQLQueryBuilderService,
    protected repository: ClickHouseDBRepository<Entity>,
    protected schema: ClickHouseDBEntitySchema<Entity>
  ) {
    super(configProvider, qb, repository, schema);
    this.primaryKeys = repository.primaryKeys;
  }
}
