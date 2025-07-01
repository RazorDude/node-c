import { ApplicationError, GenericObject, PersistanceOrderByDirection } from '@node-c/core';
import { OrmDeleteQueryBuilder, OrmSelectQueryBuilder, OrmUpdateQueryBuilder } from '@node-c/persistance-rdb';

import { ClickHouseEntityManager } from '../entityManager';
import { ClickHouseDBEntitySchema } from '../repository/clickhouse.repository.definitions';

// TODO: field selection, join, update, delete
export class ClickHouseSelectQueryBuilder<Entity extends GenericObject<unknown>>
  implements OrmSelectQueryBuilder<Entity>
{
  protected deletedColumn?: string;
  protected limitClause: string = '';
  protected offsetClause: string = '';
  protected orderByClause: string = '';
  protected whereClause: string = '';
  protected withDeletedEnabled: boolean = false;

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected manager: ClickHouseEntityManager,
    // eslint-disable-next-line no-unused-vars
    protected schema: ClickHouseDBEntitySchema
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
    return !withDeletedEnabled && deletedColumn
      ? `${whereClause.replace('where ', 'where (')}) and \`${deletedColumn}\` is null`
      : whereClause;
  }

  addOrderBy(field: string, direction: PersistanceOrderByDirection): ClickHouseSelectQueryBuilder<Entity> {
    this.orderByClause += `, ${this.parseOrderByClause(field, direction)}`;
    return this;
  }

  andWhere(query: string, params?: GenericObject<unknown>): ClickHouseSelectQueryBuilder<Entity> {
    this.whereClause += ` and (${this.parseWhereClause(query, params)})`;
    return this;
  }

  delete(): OrmDeleteQueryBuilder<Entity> {
    throw new ApplicationError('Method ClickHouseSelectQueryBuilder.delete not implemented.');
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
    const result = (await this.manager.query(
      `select count() from \`${tableName}\` as \`${name}\` ` +
        `${this.addDeletedToWhereClause()} ${orderByClause} ${limitClause} ${offsetClause}`
    )) as [{ 'count()': string }];
    return parseInt(result[0]['count()'], 10);
  }

  getMany(): Promise<Entity[]> {
    const {
      limitClause,
      offsetClause,
      orderByClause,
      schema: {
        options: { name, tableName }
      }
    } = this;
    return this.manager.query(
      `select * from \`${tableName}\` as \`${name}\` ` +
        `${this.addDeletedToWhereClause()} ${orderByClause} ${limitClause} ${offsetClause}`
    ) as Promise<Entity[]>;
  }

  async getOne(): Promise<Entity | null> {
    const {
      orderByClause,
      schema: {
        options: { name, tableName }
      }
    } = this;
    const result = this.manager.query(
      `select * from \`${tableName}\` as \`${name}\` ${this.addDeletedToWhereClause()} ${orderByClause} limit 1`
    ) as Promise<Entity>;
    return result || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  leftJoinAndSelect(..._args: unknown[]): ClickHouseSelectQueryBuilder<Entity> {
    throw new ApplicationError('Method ClickHouseSelectQueryBuilder.leftJoinAndSelect not implemented.');
  }

  orWhere(query: string, params?: GenericObject<unknown>): ClickHouseSelectQueryBuilder<Entity> {
    this.whereClause += ` or (${this.parseWhereClause(query, params)})`;
    return this;
  }

  orderBy(field: string, direction: PersistanceOrderByDirection): ClickHouseSelectQueryBuilder<Entity> {
    this.orderByClause += `order by ${this.parseOrderByClause(field, direction)}`;
    return this;
  }

  protected parseOrderByClause(field: string, direction: PersistanceOrderByDirection): string {
    return `${field.replace(/[';]/g, '')} ${direction.replace(/[';]/g, '')}`;
  }

  protected parseWhereClause(query: string, params?: GenericObject<unknown>): string {
    let queryWithReplacements = `${query.replace(/[';]/g, '')}`;
    if (params) {
      for (const paramName in params) {
        const rawValue = params[paramName];
        if (typeof rawValue === 'undefined') {
          continue;
        }
        // TODO: process dates, arrays and stringifyable objects
        let value = '';
        if (typeof rawValue === 'string') {
          value = `'${rawValue.replace(/'/g, "\'")}'`;
        } else {
          value = `${rawValue}`;
        }
        queryWithReplacements = queryWithReplacements.replace(`:${paramName}`, value);
      }
    }
    return queryWithReplacements;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select(_selection: string[]): ClickHouseSelectQueryBuilder<Entity> {
    throw new ApplicationError('Method ClickHouseSelectQueryBuilder.select not implemented.');
  }

  skip(skipCount: number): ClickHouseSelectQueryBuilder<Entity> {
    // we need this to prevent SQL injection, since TS types don't work at runtime
    if (typeof skipCount !== 'number') {
      throw new ApplicationError('Method ClickHouseSelectQueryBuilder.skip expects a number input for skipCount.');
    }
    this.offsetClause = `offset ${skipCount}`;
    return this;
  }

  softDelete(): OrmDeleteQueryBuilder<Entity> {
    throw new ApplicationError('Method ClickHouseSelectQueryBuilder.softDelete not implemented.');
  }

  take(takeCount: number): ClickHouseSelectQueryBuilder<Entity> {
    // we need this to prevent SQL injection, since TS types don't work at runtime
    if (typeof takeCount !== 'number') {
      throw new ApplicationError('Method ClickHouseSelectQueryBuilder.take expects a number input for takeCount.');
    }
    this.limitClause += `limit ${takeCount}`;
    return this;
  }

  update(): OrmUpdateQueryBuilder<Entity> {
    throw new ApplicationError('Method ClickHouseSelectQueryBuilder.update not implemented.');
  }

  where(query: string, params?: GenericObject<unknown>): ClickHouseSelectQueryBuilder<Entity> {
    this.whereClause += `where (${this.parseWhereClause(query, params)})`;
    return this;
  }

  withDeleted(): OrmSelectQueryBuilder<Entity> {
    this.withDeletedEnabled = true;
    return this;
  }
}
