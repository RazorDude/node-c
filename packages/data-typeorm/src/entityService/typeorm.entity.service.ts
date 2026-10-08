import type { DataDefaultData } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/data-rdb';
import type { ObjectLiteral } from 'typeorm';
// biome-ignore lint/style/useImportType: DI.
import { EntitySchema } from 'typeorm';

// biome-ignore lint/style/useImportType: DI.
import { TypeORMDBRepository } from '../repository/typeorm.repository.js';

export class TypeORMDBEntityService<
  Entity extends ObjectLiteral,
  Data extends DataDefaultData<Entity> = DataDefaultData<Entity>
> extends RDBEntityService<Entity, Data> {
  // biome-ignore lint/complexity/useMaxParams: DI in contructor.
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected qb: SQLQueryBuilderService,
    protected repository: TypeORMDBRepository<Entity>,
    protected schema: EntitySchema
  ) {
    super(configProvider, logger, qb, repository, schema);
  }
}
