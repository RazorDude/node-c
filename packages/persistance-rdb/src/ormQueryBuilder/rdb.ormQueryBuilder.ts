import { PersistanceOrderByDirection } from '@node-c/core';

export abstract class OrmBaseQueryBuilder<Entity> {
  abstract andWhere(..._args: unknown[]): OrmBaseQueryBuilder<Entity>;
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
  abstract delete(): OrmDeleteQueryBuilder<Entity>; // new
  abstract getCount(): Promise<number>; // new
  abstract getMany(): Promise<Entity[]>; // new
  abstract getOne(): Promise<Entity | null>; // new
  // abstract leftJoinAndSelect(_relationProperty: string, _relationAlias: string): OrmSelectQueryBuilder<Entity>;
  // abstract leftJoinAndSelect(
  //   _relationProperty: string,
  //   _relationAlias: string,
  //   _condition: string
  // ): OrmSelectQueryBuilder<Entity>;
  abstract leftJoinAndSelect(..._args: unknown[]): OrmSelectQueryBuilder<Entity>;
  abstract orderBy(_field: string, _direction: PersistanceOrderByDirection): OrmSelectQueryBuilder<Entity>;
  abstract select(_selection: string[]): OrmSelectQueryBuilder<Entity>;
  abstract skip(_skipCount?: number): OrmSelectQueryBuilder<Entity>; // new
  abstract softDelete(): OrmDeleteQueryBuilder<Entity>; // new
  abstract take(_takeCount?: number): OrmSelectQueryBuilder<Entity>; // new
  abstract update(): OrmUpdateQueryBuilder<Entity>; // new
  abstract withDeleted(): OrmSelectQueryBuilder<Entity>;
}

export abstract class OrmUpdateQueryBuilder<Entity> extends OrmBaseQueryBuilder<Entity> {
  abstract execute(): Promise<OrmUpdateQueryBuilderUpdateResult>;
  abstract returning(_selection: string | string[]): OrmUpdateQueryBuilder<Entity>;
  // abstract set(_data: Partial<Entity>): OrmUpdateQueryBuilder<Entity>;
  abstract set(..._args: unknown[]): OrmUpdateQueryBuilder<Entity>;
}

export interface OrmUpdateQueryBuilderUpdateResult {
  affected?: number;
  generatedMaps?: object[];
  raw: unknown;
}
