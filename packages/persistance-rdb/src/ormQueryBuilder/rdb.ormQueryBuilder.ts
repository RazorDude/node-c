import { PersistanceOrderByDirection } from '@node-c/core';

export abstract class OrmBaseQueryBuilder<Entity> {
  abstract andWhere(..._args: unknown[]): OrmBaseQueryBuilder<Entity>;
  abstract orWhere(..._args: unknown[]): OrmBaseQueryBuilder<Entity>;
  abstract where(..._args: unknown[]): OrmBaseQueryBuilder<Entity>;
}

export abstract class OrmDeleteQueryBuilder<Entity> extends OrmBaseQueryBuilder<Entity> {
  abstract execute(): Promise<OrmDeleteQueryBuilderDeleteResult>;
}

export interface OrmDeleteQueryBuilderDeleteResult {
  affected?: number | null;
  raw: unknown;
}

export abstract class OrmSelectQueryBuilder<Entity> extends OrmBaseQueryBuilder<Entity> {
  abstract addOrderBy(_field: string, _direction: PersistanceOrderByDirection): OrmSelectQueryBuilder<Entity>;
  abstract delete(): OrmDeleteQueryBuilder<Entity>;
  abstract getCount(): Promise<number>;
  abstract getMany(): Promise<Entity[]>;
  abstract getOne(): Promise<Entity | null>;
  abstract leftJoinAndSelect(..._args: unknown[]): OrmSelectQueryBuilder<Entity>;
  abstract orderBy(_field: string, _direction: PersistanceOrderByDirection): OrmSelectQueryBuilder<Entity>;
  abstract select(_selection: string[]): OrmSelectQueryBuilder<Entity>;
  abstract skip(_skipCount: number): OrmSelectQueryBuilder<Entity>;
  abstract softDelete(): OrmDeleteQueryBuilder<Entity>;
  abstract take(_takeCount: number): OrmSelectQueryBuilder<Entity>;
  abstract update(): OrmUpdateQueryBuilder<Entity>;
  abstract withDeleted(): OrmSelectQueryBuilder<Entity>;
}

export abstract class OrmUpdateQueryBuilder<Entity> extends OrmBaseQueryBuilder<Entity> {
  abstract execute(): Promise<OrmUpdateQueryBuilderUpdateResult>;
  abstract returning(_selection: string | string[]): OrmUpdateQueryBuilder<Entity>;
  abstract set(..._args: unknown[]): OrmUpdateQueryBuilder<Entity>;
}

export interface OrmUpdateQueryBuilderUpdateResult {
  affected?: number;
  generatedMaps?: object[];
  raw: unknown;
}
