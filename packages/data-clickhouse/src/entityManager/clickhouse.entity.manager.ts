import type { ClickHouseClient } from '@clickhouse/client';
import { Inject, Injectable } from '@nestjs/common';

import type { GenericObject } from '@node-c/core';
import {
  Constants as RDBConstants,
  type RDBEntityManager,
  type RDBRepository
} from '@node-c/data-rdb';

import { Constants } from '../common/definitions/common.constants.js';

@Injectable()
export class ClickHouseEntityManager implements RDBEntityManager {
  constructor(
    @Inject(Constants.CLICKHOUSE_CLIENT)
    protected client: ClickHouseClient,
    @Inject(RDBConstants.RDB_ENTITY_REPOSITORY)
    protected repository: RDBRepository<GenericObject<unknown>>
  ) {}

  getRepository<Entity extends GenericObject<unknown>>(
    _target: string
  ): RDBRepository<Entity> {
    return this.repository as RDBRepository<Entity>;
  }

  // TODO: column aliases
  insert(data: Record<string, unknown>[]): Promise<unknown> {
    return this.client.insert({
      format: 'JSONEachRow',
      table: this.repository.metadata.tableName,
      values: data
    });
  }

  async query<ReturnData = unknown>(
    query: string,
    params?: { field: string; value: string | number }[]
  ): Promise<ReturnData> {
    let queryParams: Record<string, string | number> | undefined;
    if (params?.length) {
      queryParams = {};
      params.forEach((item) => {
        queryParams![item.field] = item.value;
      });
    }
    const results = await this.client.query({
      format: 'JSON',
      query,
      query_params: queryParams
    });
    const jsonData = await results.json();
    return jsonData as ReturnData;
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
  transaction(
    callback: (_em: ClickHouseEntityManager) => Promise<unknown>
  ): Promise<unknown> {
    return callback(this);
  }
}
