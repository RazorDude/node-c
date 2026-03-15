import { ConfigProviderService, DataDefaultData, LoggerService } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/data-rdb';

import { EntitySchema, ObjectLiteral } from 'typeorm';

import { TypeORMDBRepository } from '../repository';

export class TypeORMDBEntityService<
  Entity extends ObjectLiteral,
  Data extends DataDefaultData<Entity> = DataDefaultData<Entity>
> extends RDBEntityService<Entity, Data> {
  protected primaryKeys: string[];

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
