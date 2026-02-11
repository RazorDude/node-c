import { ConfigProviderService, DataDefaultData } from '@node-c/core';
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
    protected qb: SQLQueryBuilderService,
    protected repository: TypeORMDBRepository<Entity>,
    protected schema: EntitySchema
  ) {
    super(configProvider, qb, repository, schema);
  }
}
