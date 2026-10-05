import type {
  ConfigProviderService,
  DataDefaultData,
  LoggerService
} from '@node-c/core';
import {
  RDBEntityService,
  type SQLQueryBuilderService
} from '@node-c/data-rdb';

import type { EntitySchema, ObjectLiteral } from 'typeorm';

import type { TypeORMDBRepository } from '../repository/typeorm.repository.js';

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
