import { forwardRef, Inject, Injectable } from '@nestjs/common';

import type { GenericObject } from '@node-c/core';
import {
  Constants as RDBConstants,
  type RDBRepository
} from '@node-c/data-rdb';
import { ClickHouseEntityManager } from '../entityManager/clickhouse.entity.manager.js';
import { ClickHouseSelectQueryBuilder } from '../ormQueryBuilder/clickhouse.selectQueryBuilder.js';
import type * as ClickhouseRepositoryDefinitions from './clickhouse.repository.definitions.js';

// TODO: save method
@Injectable()
export class ClickHouseDBRepository<Entity extends GenericObject<unknown>>
  implements RDBRepository<Entity>
{
  readonly metadata: { name: string; tableName: string };
  readonly primaryKeys: string[];
  readonly target: string;

  constructor(
    @Inject(RDBConstants.RDB_REPOSITORY_ENTITY_CLASS)
    protected entitySchema: ClickhouseRepositoryDefinitions.ClickHouseDBEntitySchema<Entity>,
    @Inject(forwardRef(() => ClickHouseEntityManager))
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

  createQueryBuilder(
    _entityName: string,
    _queryRunner?: unknown
  ): ClickHouseSelectQueryBuilder<Entity> {
    return new ClickHouseSelectQueryBuilder(this.manager, this.entitySchema);
  }

  // TODO: update
  save(
    data: Partial<Entity> | Partial<Entity[]>,
    _options?: unknown
  ): Promise<unknown> {
    // throw new ApplicationError('Method ClickHouseDBRepository.save not implemented.');
    const dataInput = (Array.isArray(data) ? data : [data]) as Entity[];
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
