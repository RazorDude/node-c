import { GenericObject } from '../../../common/definitions';

import {
  DeleteOptions,
  DeleteResult,
  FindOneOptions,
  FindOptions,
  FindResults,
  PersistanceEntityService,
  UpdateOptions,
  UpdateResult
} from '../../../persistance/common/entityService';

export class DomainPersistanceEntityService<Entity, EntityService extends PersistanceEntityService<Entity>> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected persistanceEntityService: EntityService
  ) {}

  // eslint-disable-next-line no-unused-vars
  public bulkCreate(data: Entity[] | GenericObject[]): Promise<Entity[]>;
  async bulkCreate(data: Entity[]): Promise<Entity[]> {
    return await this.persistanceEntityService.bulkCreate(data);
  }

  // eslint-disable-next-line no-unused-vars
  public create(data: Entity | GenericObject): Promise<Entity>;
  async create(data: Entity): Promise<Entity | void> {
    return await this.persistanceEntityService.create(data);
  }

  // eslint-disable-next-line no-unused-vars
  public delete(options: DeleteOptions): Promise<DeleteResult>;
  async delete(options: DeleteOptions): Promise<DeleteResult> {
    return this.persistanceEntityService.delete(options);
  }

  // eslint-disable-next-line no-unused-vars
  public find(options: FindOptions): Promise<FindResults<Entity>>;
  async find(options: FindOptions): Promise<FindResults<Entity>> {
    return this.persistanceEntityService.find(options);
  }

  // eslint-disable-next-line no-unused-vars
  public findOne(options: FindOneOptions): Promise<Entity | null>;
  async findOne(options: FindOneOptions): Promise<Entity | null> {
    return this.persistanceEntityService.findOne(options);
  }

  // eslint-disable-next-line no-unused-vars
  public update(data: Entity | GenericObject, options: UpdateOptions): Promise<UpdateResult<Entity>>;
  async update(data: Entity, options: UpdateOptions): Promise<UpdateResult<Entity>> {
    return this.persistanceEntityService.update(data, options);
  }
}
