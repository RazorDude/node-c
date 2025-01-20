import {
  DeleteOptions,
  DeleteResult,
  FindOneOptions,
  FindOptions,
  FindResults,
  UpdateOptions,
  UpdateResult
} from './peristance.entity.service.definitions';

import { ApplicationError } from '../../../common/definitions';

/*
 * This class is used as a unifying abstraction between RDB and non-RDB entities. It can be used
 * to define classes that are agnostic of the type of persitance.
 */
export class PersistanceEntityService<Entity> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async bulkCreate(_data: Entity[] | unknown[], _options?: unknown): Promise<Entity[]> {
    throw new ApplicationError(`Method bulkCreate not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async create(_data: Entity | unknown, _options?: unknown): Promise<Entity> {
    throw new ApplicationError(`Method create not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async count(_options: FindOptions): Promise<number | undefined> {
    throw new ApplicationError(`Method count not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public delete(_options: DeleteOptions): Promise<DeleteResult> {
    throw new ApplicationError(`Method delete not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public find(_options: FindOptions): Promise<FindResults<Entity>> {
    throw new ApplicationError(`Method find not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public findOne(_options: FindOneOptions): Promise<Entity | null> {
    throw new ApplicationError(`Method findOne not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async update(_data: Entity | unknown, _options: UpdateOptions): Promise<UpdateResult<Entity>> {
    throw new ApplicationError(`Method update not implemented for class ${typeof this}.`);
  }
}
