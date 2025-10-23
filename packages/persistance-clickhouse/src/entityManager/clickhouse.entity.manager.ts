import { ClickHouseClient } from '@clickhouse/client';
import { Inject, Injectable } from '@nestjs/common';

import { GenericObject } from '@node-c/core';
import { Constants as RDBConstants, RDBEntityManager, RDBRepository } from '@node-c/persistance-rdb';

import { Constants } from '../common/definitions';

@Injectable()
export class ClickHouseEntityManager implements RDBEntityManager {
  constructor(
    @Inject(Constants.CLICKHOUSE_CLIENT)
    // eslint-disable-next-line no-unused-vars
    protected client: ClickHouseClient,
    @Inject(RDBConstants.RDB_ENTITY_REPOSITORY)
    // eslint-disable-next-line no-unused-vars
    protected repository: RDBRepository<GenericObject<unknown>>
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRepository<Entity extends GenericObject<unknown>>(_target: string): RDBRepository<Entity> {
    return this.repository as RDBRepository<Entity>;
  }

  // TODO: column aliases
  insert(data: Record<string, unknown>[]): Promise<unknown> {
    // const columnsMap: Record<string, number> = {};
    // const values: unknown[] = [];
    // let currentColumnsCount = 0;
    // data.forEach(dataItem => {
    //   for (const fieldName in dataItem) {
    //     if (typeof columnsMap[fieldName] === 'undefined') {
    //       currentColumnsCount++;
    //       columnsMap[fieldName] = currentColumnsCount;
    //     }
    //   }
    //   Object.keys(columnsMap)
    //     .sort((a, b) => columnsMap[a] - columnsMap[b])
    //     .forEach(columnName => {
    //       const columnValue = dataItem[columnName];
    //       if (typeof columnValue === 'undefined') {
    //         values.push('DEFAULT');
    //         return;
    //       }
    //       values.push(columnValue);
    //     });
    // });
    return this.client.insert({
      // columns: Object.keys(columnsMap).sort((a, b) => columnsMap[a] - columnsMap[b]) as InsertParams['columns'],
      format: 'JSONEachRow',
      table: this.repository.metadata.tableName,
      // values
      values: data
    });
  }

  query(query: string, params?: { field: string; value: string | number }[]): Promise<unknown> {
    let queryParams: Record<string, string | number> | undefined = undefined;
    if (params?.length) {
      queryParams = {};
      params.forEach(item => (queryParams![item.field] = item.value));
    }
    return this.client.query({ query, query_params: queryParams });
  }

  // TODO: figure out how to de-circularize this
  save<Entity extends GenericObject<unknown> = GenericObject<unknown>>(
    _target: unknown,
    data: Partial<Entity> | Partial<Entity[]>,
    options?: unknown
  ): Promise<unknown> {
    return this.repository.save(data, options);
  }

  // TODO: actual transactions
  transaction(callback: (_em: ClickHouseEntityManager) => Promise<unknown>): Promise<unknown> {
    return callback(this);
  }
}
