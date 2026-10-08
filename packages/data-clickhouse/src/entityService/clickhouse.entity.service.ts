import type { DataDefaultData, GenericObject } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/data-rdb';

// biome-ignore lint/style/useImportType: DI.
import { ClickHouseDBEntitySchema } from '../repository/clickhouse.repository.definitions.js';
// biome-ignore lint/style/useImportType: DI.
import { ClickHouseDBRepository } from '../repository/clickhouse.repository.js';

export class ClickHouseDBEntityService<
  Entity extends GenericObject,
  Data extends DataDefaultData<Entity> = DataDefaultData<Entity>
> extends RDBEntityService<Entity, Data> {
  protected primaryKeys: string[];

  // biome-ignore lint/complexity/useMaxParams: DI in constructor.
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
