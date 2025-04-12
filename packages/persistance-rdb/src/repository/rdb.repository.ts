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
    name: string;
    tableName: string;
  };
  target: unknown;

  abstract createQueryBuilder(_entityName: string, _queryRunner?: unknown): OrmSelectQueryBuilder<Entity>;
  abstract save(_data: Partial<Entity> | Partial<Entity[]>, _options?: unknown): Promise<unknown>;
}
