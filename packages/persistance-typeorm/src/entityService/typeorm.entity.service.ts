import { ConfigProviderService } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { EntitySchema, ObjectLiteral } from 'typeorm';

import { TypeORMDBRepository } from '../repository';

export class TypeORMDBEntityService<Entity extends ObjectLiteral> extends RDBEntityService<Entity> {
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
