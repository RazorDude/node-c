import {
  PersistanceDeleteOptions,
  PersistanceDeleteResult,
  PersistanceFindOneOptions,
  PersistanceFindOptions,
  PersistanceFindResults,
  PersistanceUpdateOptions,
  PersistanceUpdateResult
} from './persistance.entity.service.definitions';

import { ApplicationError } from '../../common/definitions';

/*
 * This class is used as a unifying abstraction between RDB and non-RDB entities. It can be used
 * to define classes that are agnostic of the type of persitance.
 */
export class PersistanceEntityService<Entity> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async bulkCreate(_data: Partial<Entity>[], _options?: unknown, _privateOptions?: unknown): Promise<Entity[]> {
    throw new ApplicationError(`Method bulkCreate not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async create(_data: Partial<Entity>, _options?: unknown, _privateOptions?: unknown): Promise<Entity> {
    throw new ApplicationError(`Method create not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async count(_options: PersistanceFindOptions, _privateOptions?: unknown): Promise<number | undefined> {
    throw new ApplicationError(`Method count not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public delete(_options: PersistanceDeleteOptions, _privateOptions?: unknown): Promise<PersistanceDeleteResult> {
    throw new ApplicationError(`Method delete not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public find(_options: PersistanceFindOptions, _privateOptions?: unknown): Promise<PersistanceFindResults<Entity>> {
    throw new ApplicationError(`Method find not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public findOne(_options: PersistanceFindOneOptions, _privateOptions?: unknown): Promise<Entity | null> {
    throw new ApplicationError(`Method findOne not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getEntityName(): Promise<string> {
    throw new ApplicationError(`Method getEntityName not implemented for class ${typeof this}.`);
  }

  public async update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Partial<Entity>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceUpdateOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: unknown
  ): Promise<PersistanceUpdateResult<Entity>> {
    throw new ApplicationError(`Method update not implemented for class ${typeof this}.`);
  }
}
