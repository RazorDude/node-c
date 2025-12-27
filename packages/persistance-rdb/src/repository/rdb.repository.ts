import { GenericObject, GenericObjectType } from '@node-c/core';

import { OrmSelectQueryBuilder } from '../ormQueryBuilder';

export abstract class RDBEntityManager {
  abstract getRepository<Entity extends GenericObject<unknown>>(_target: unknown): RDBRepository<Entity>;
  abstract query(_query: string, _params?: unknown[]): Promise<unknown>;
  abstract save<Entity extends GenericObject<unknown> = GenericObject<unknown>>(
    _target: unknown,
    _data: Partial<Entity> | Partial<Entity[]>,
    _options?: unknown
  ): Promise<unknown>;
  abstract transaction(_callback: (_em: RDBEntityManager) => Promise<unknown>): Promise<unknown>;
}

export type RDBEntityTarget<Entity> = string | { name: string; type: Entity } | GenericObjectType<Entity>;

export abstract class RDBRepository<Entity extends GenericObject<unknown>> {
  manager: RDBEntityManager;
  metadata: {
    deleteDateColumn?: { databaseName: string; propertyName: string };
    name: string;
    relations?: {
      joinTableName?: string;
      propertyName: string;
      propertyPath: string;
      relationType: string;
      target: string | unknown;
      // unfortunately, we need to use this type definition here, otherwise it won't match the one in TypeOrm
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      type: string | Function;
    }[];
    tableName: string;
  };
  target: unknown;

  abstract createQueryBuilder(_entityName: string, _queryRunner?: unknown): OrmSelectQueryBuilder<Entity>;
  abstract save(_data: Partial<Entity> | Partial<Entity[]>, _options?: unknown): Promise<unknown>;
}
