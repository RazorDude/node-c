import { ConfigProviderService, DataDefaultData, GenericObject, LoggerService } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/data-rdb';

import { ClickHouseDBEntitySchema, ClickHouseDBRepository } from '../repository';

export class ClickHouseDBEntityService<
  Entity extends GenericObject,
  Data extends DataDefaultData<Entity> = DataDefaultData<Entity>
> extends RDBEntityService<Entity, Data> {
  protected primaryKeys: string[];

  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected qb: SQLQueryBuilderService,
    protected repository: ClickHouseDBRepository<Entity>,
    protected schema: ClickHouseDBEntitySchema<Entity>
  ) {
    super(configProvider, logger, qb, repository, schema);
    this.primaryKeys = repository.primaryKeys;
  }
}
