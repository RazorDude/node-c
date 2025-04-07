import { GenericObject } from '@node-c/core';

import { RDBRepository } from '../repository';

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
