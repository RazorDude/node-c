import { GenericObject, GenericObjectType } from '@node-c/core';

import { RDBEntityManager } from '../entityManager';
import { OrmSelectQueryBuilder } from '../ormQueryBuilder';

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
