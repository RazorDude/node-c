import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { GenericObject } from '@node-c/core';
import { Constants as RDBConstants, RDBRepository } from '@node-c/data-rdb';

import { ClickHouseDBEntitySchema } from './clickhouse.repository.definitions';

import { ClickHouseEntityManager } from '../entityManager';
import { ClickHouseSelectQueryBuilder } from '../ormQueryBuilder';

// TODO: save method
@Injectable()
export class ClickHouseDBRepository<Entity extends GenericObject<unknown>> implements RDBRepository<Entity> {
  readonly metadata: { name: string; tableName: string };
  readonly primaryKeys: string[];
  readonly target: string;

  constructor(
    @Inject(RDBConstants.RDB_REPOSITORY_ENTITY_CLASS)
    protected entitySchema: ClickHouseDBEntitySchema<Entity>,
    @Inject(forwardRef(() => ClickHouseEntityManager))
    // eslint-disable-next-line no-unused-vars
    public readonly manager: ClickHouseEntityManager
  ) {
    const {
      options: { columns, name, tableName }
    } = entitySchema;
    const primaryKeys: string[] = [];
    this.metadata = { name, tableName };
    for (const columnName in columns) {
      if (columns[columnName]?.primary) {
        primaryKeys.push(columnName);
      }
    }
    this.primaryKeys = primaryKeys;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createQueryBuilder(_entityName: string, _queryRunner?: unknown): ClickHouseSelectQueryBuilder<Entity> {
    return new ClickHouseSelectQueryBuilder(this.manager, this.entitySchema);
  }

  // TODO: update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(data: Partial<Entity> | Partial<Entity[]>, _options?: unknown): Promise<unknown> {
    // throw new ApplicationError('Method ClickHouseDBRepository.save not implemented.');
    const dataInput = (data instanceof Array ? data : [data]) as Entity[];
    // const {
    //   options: { columns }
    // } = this.entitySchema;
    // const columnsMap: GenericObject<boolean> = {};
    // const params: GenericObject<unknown> = {};
    // // first pass - go through all data items and make a list of columns for the header of the insert query
    // dataInput.forEach(dataItem => {
    //   for (const columnName in columns) {
    //     const value = dataItem[columnName];
    //     if (typeof value === 'undefined') {
    //       continue;
    //     }
    //     if (!columnsMap[columnName]) {
    //       columnsMap[columnName] = true;
    //     }
    //   }
    // });
    // // second pass - prepare the data itself
    return this.manager.insert(dataInput);
  }
}
