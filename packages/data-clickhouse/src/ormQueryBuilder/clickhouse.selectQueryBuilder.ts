import {
  ApplicationError,
  DataOrderByDirection,
  GenericObject
} from '@node-c/core';
import {
  OrmDeleteQueryBuilder,
  OrmSelectQueryBuilder,
  OrmUpdateQueryBuilder
} from '@node-c/data-rdb';

import { ClickHouseEntityManager } from '../entityManager/clickhouse.entity.manager.js';
import { ClickHouseDBEntitySchema } from '../repository/clickhouse.repository.definitions.js';

const paramNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

// TODO: field selection, join, update, delete
export class ClickHouseSelectQueryBuilder<Entity extends GenericObject<unknown>>
  implements OrmSelectQueryBuilder<Entity>
{
  protected deletedColumn?: string;
  protected limitClause = '';
  protected offsetClause = '';
  protected orderByClause = '';
  // the values are sent separately from the query, as query_params, so that they are escaped by the ClickHouse client
  protected queryParams: { field: string; value: unknown }[] = [];
  protected queryParamValues: GenericObject<unknown> = {};
  protected whereClause = '';
  protected withDeletedEnabled = false;

  constructor(
    protected manager: ClickHouseEntityManager,
    protected schema: ClickHouseDBEntitySchema<Entity>
  ) {
    const {
      options: { columns }
    } = schema;
    for (const columnName in columns) {
      if (columns[columnName].isDeletionDate) {
        this.deletedColumn = columnName;
        break;
      }
    }
  }

  protected addDeletedToWhereClause(): string {
    const { deletedColumn, whereClause, withDeletedEnabled } = this;
    return withDeletedEnabled !== true && deletedColumn
      ? `${whereClause.replace('where ', 'where (')}) and \`${deletedColumn}\` is null`
      : whereClause;
  }

  addOrderBy(
    field: string,
    direction: DataOrderByDirection
  ): ClickHouseSelectQueryBuilder<Entity> {
    this.orderByClause += `, ${this.parseOrderByClause(field, direction)}`;
    return this;
  }

  andWhere(
    query: string,
    params?: GenericObject<unknown>
  ): ClickHouseSelectQueryBuilder<Entity> {
    this.whereClause += ` and (${this.parseWhereClause(query, params)})`;
    return this;
  }

  delete(): OrmDeleteQueryBuilder<Entity> {
    throw new ApplicationError(
      'Method ClickHouseSelectQueryBuilder.delete not implemented.'
    );
  }

  async getCount(): Promise<number> {
    const {
      limitClause,
      offsetClause,
      orderByClause,
      schema: {
        options: { name, tableName }
      }
    } = this;
    const result = await this.manager.query<{ data: [{ 'count()': string }] }>(
      `select count() from \`${tableName}\` as \`${name}\` ` +
        `${this.addDeletedToWhereClause()} ${orderByClause} ${limitClause} ${offsetClause}`,
      this.queryParams
    );
    return Number.parseInt(result.data[0]?.['count()'], 10);
  }

  async getMany(): Promise<Entity[]> {
    const {
      limitClause,
      offsetClause,
      orderByClause,
      schema: {
        options: { name, tableName }
      }
    } = this;
    const result = await this.manager.query<{ data: Entity[] }>(
      `select * from \`${tableName}\` as \`${name}\` ` +
        `${this.addDeletedToWhereClause()} ${orderByClause} ${limitClause} ${offsetClause}`,
      this.queryParams
    );
    return result.data;
  }

  async getOne(): Promise<Entity | null> {
    const {
      orderByClause,
      schema: {
        options: { name, tableName }
      }
    } = this;
    const result = await this.manager.query<{ data: Entity }>(
      `select * from \`${tableName}\` as \`${name}\` ${this.addDeletedToWhereClause()} ${orderByClause} limit 1`,
      this.queryParams
    );
    return result.data || null;
  }

  leftJoinAndSelect(..._args: unknown[]): ClickHouseSelectQueryBuilder<Entity> {
    throw new ApplicationError(
      'Method ClickHouseSelectQueryBuilder.leftJoinAndSelect not implemented.'
    );
  }

  orWhere(
    query: string,
    params?: GenericObject<unknown>
  ): ClickHouseSelectQueryBuilder<Entity> {
    this.whereClause += ` or (${this.parseWhereClause(query, params)})`;
    return this;
  }

  orderBy(
    field: string,
    direction: DataOrderByDirection
  ): ClickHouseSelectQueryBuilder<Entity> {
    this.orderByClause += `order by ${this.parseOrderByClause(field, direction)}`;
    return this;
  }

  protected parseOrderByClause(
    field: string,
    direction: DataOrderByDirection
  ): string {
    const {
      options: { columns, name }
    } = this.schema;
    // identifiers can't be sent as query params, so the field must be one of the schema's columns,
    // optionally prefixed with the entity's alias - e.g. datetime or userLoginLog.datetime
    const fieldData = field.split('.');
    let columnName: string | undefined;
    if (fieldData.length === 1) {
      columnName = fieldData[0];
    } else if (fieldData.length === 2 && fieldData[0] === name) {
      columnName = fieldData[1];
    }
    if (!(columnName && Object.hasOwn(columns, columnName))) {
      throw new ApplicationError(
        `Method ClickHouseSelectQueryBuilder.orderBy received an invalid field: ${field}.`
      );
    }
    if (
      direction !== DataOrderByDirection.Asc &&
      direction !== DataOrderByDirection.Desc
    ) {
      throw new ApplicationError(
        `Method ClickHouseSelectQueryBuilder.orderBy received an invalid direction: ${direction}.`
      );
    }
    return `\`${name}\`.\`${columnName}\` ${direction}`;
  }

  protected parseWhereClause(
    query: string,
    params?: GenericObject<unknown>
  ): string {
    const { queryParamValues } = this;
    let queryWithPlaceholders = `${query.replace(/[';]/g, '')}`;
    if (params) {
      for (const paramName in params) {
        const value = params[paramName];
        if (typeof value === 'undefined') {
          continue;
        }
        // the name is used both in the query and in a regular expression below, so it must be a plain identifier
        if (!paramNameRegex.test(paramName)) {
          throw new ApplicationError(
            `Method ClickHouseSelectQueryBuilder.where received an invalid parameter name: ${paramName}.`
          );
        }
        // TODO: arrays and stringifyable objects
        let paramType: string;
        if (typeof value === 'string') {
          paramType = 'String';
        } else if (typeof value === 'boolean') {
          paramType = 'Bool';
        } else if (typeof value === 'bigint') {
          paramType = 'Int64';
        } else if (typeof value === 'number') {
          paramType = Number.isInteger(value) ? 'Int64' : 'Float64';
        } else if (value instanceof Date) {
          paramType = 'DateTime64(3)';
        } else {
          throw new ApplicationError(
            `Method ClickHouseSelectQueryBuilder.where received an unsupported value type for parameter ${paramName}.`
          );
        }
        if (Object.hasOwn(queryParamValues, paramName)) {
          if (queryParamValues[paramName] !== value) {
            throw new ApplicationError(
              `Method ClickHouseSelectQueryBuilder.where received a different value for the already used parameter ${paramName}.`
            );
          }
        } else {
          queryParamValues[paramName] = value;
          this.queryParams.push({ field: paramName, value });
        }
        // the lookahead prevents :name_1 from matching the start of :name_10
        queryWithPlaceholders = queryWithPlaceholders.replace(
          new RegExp(`:${paramName}(?![A-Za-z0-9_])`, 'g'),
          `{${paramName}:${paramType}}`
        );
      }
    }
    return queryWithPlaceholders;
  }

  select(_selection: string[]): ClickHouseSelectQueryBuilder<Entity> {
    throw new ApplicationError(
      'Method ClickHouseSelectQueryBuilder.select not implemented.'
    );
  }

  skip(skipCount: number): ClickHouseSelectQueryBuilder<Entity> {
    // we need this to prevent SQL injection, since TS types don't work at runtime;
    // NaN and negative values are numbers too, but they would break the query
    if (!Number.isInteger(skipCount) || skipCount < 0) {
      throw new ApplicationError(
        'Method ClickHouseSelectQueryBuilder.skip expects a non-negative integer input for skipCount.'
      );
    }
    this.offsetClause = `offset ${skipCount}`;
    return this;
  }

  softDelete(): OrmDeleteQueryBuilder<Entity> {
    throw new ApplicationError(
      'Method ClickHouseSelectQueryBuilder.softDelete not implemented.'
    );
  }

  take(takeCount: number): ClickHouseSelectQueryBuilder<Entity> {
    // we need this to prevent SQL injection, since TS types don't work at runtime;
    // NaN and negative values are numbers too, but they would break the query
    if (!Number.isInteger(takeCount) || takeCount < 0) {
      throw new ApplicationError(
        'Method ClickHouseSelectQueryBuilder.take expects a non-negative integer input for takeCount.'
      );
    }
    this.limitClause += `limit ${takeCount}`;
    return this;
  }

  update(): OrmUpdateQueryBuilder<Entity> {
    throw new ApplicationError(
      'Method ClickHouseSelectQueryBuilder.update not implemented.'
    );
  }

  where(
    query: string,
    params?: GenericObject<unknown>
  ): ClickHouseSelectQueryBuilder<Entity> {
    this.whereClause += `where (${this.parseWhereClause(query, params)})`;
    return this;
  }

  withDeleted(): OrmSelectQueryBuilder<Entity> {
    this.withDeletedEnabled = true;
    return this;
  }
}
