import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { EntitySchema, ObjectLiteral } from 'typeorm';

import { TypeORMDBRepository } from '../repository';

export class TypeORMDBEntityService<Entity extends ObjectLiteral> extends RDBEntityService<Entity> {
  protected primaryKeys: string[];

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected qb: SQLQueryBuilderService,
    // eslint-disable-next-line no-unused-vars
    protected repository: TypeORMDBRepository<Entity>,
    protected schema: EntitySchema
  ) {
    super(qb, repository, schema);
    const { columns } = schema.options;
    const primaryKeys: string[] = [];
    for (const columnName in columns) {
      if (columns[columnName]?.primary) {
        primaryKeys.push(columnName);
      }
    }
    this.primaryKeys = primaryKeys;
  }
}
