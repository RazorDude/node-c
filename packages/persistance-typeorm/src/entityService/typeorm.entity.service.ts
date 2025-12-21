import { ConfigProviderService } from '@node-c/core';
import { DefaultData, RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { EntitySchema, ObjectLiteral } from 'typeorm';

import { TypeORMDBRepository } from '../repository';

export class TypeORMDBEntityService<
  Entity extends ObjectLiteral,
  Data extends DefaultData<Entity> = DefaultData<Entity>
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
