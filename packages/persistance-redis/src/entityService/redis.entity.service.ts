import {
  PersistanceDeleteResult,
  PersistanceEntityService,
  PersistanceFindResults,
  PersistanceUpdateResult
} from '@node-c/core';

import { mergeDeepRight as merge } from 'ramda';

import {
  BulkCreateOptions,
  CreateOptions,
  DeleteOptions,
  FindOneOptions,
  FindOptions,
  UpdateOptions
} from './redis.entity.service.definitions';

import { RedisRepositoryService } from '../repository';
import { RedisStoreService } from '../store';

// TODO: support "pseudo-relations"
// TODO: support update of multiple items in the update method
export class RedisEntityService<Entity extends object> extends PersistanceEntityService<Entity> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected repository: RedisRepositoryService<Entity>,
    // eslint-disable-next-line no-unused-vars
    protected store: RedisStoreService
  ) {
    super();
  }

  async bulkCreate(data: Entity[], options?: BulkCreateOptions): Promise<Entity[]> {
    const { repository, store } = this;
    const actualOptions = Object.assign(options || {}) as BulkCreateOptions;
    const { forceTransaction, transactionId } = actualOptions;
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.bulkCreate(data, { ...actualOptions, transactionId: tId });
      await store.endTransaction(tId);
      return result;
    }
    return (await repository.save(data, { transactionId })) as Entity[];
  }

  async create(data: Entity, options?: CreateOptions): Promise<Entity> {
    const { repository, store } = this;
    const actualOptions = Object.assign(options || {}) as CreateOptions;
    const { forceTransaction, transactionId } = actualOptions;
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.create(data, { ...actualOptions, transactionId: tId });
      await store.endTransaction(tId);
      return result;
    }
    return (await repository.save(data, { transactionId }))[0];
  }

  async count(options: FindOptions): Promise<number | undefined> {
    const { repository } = this;
    const { filters, findAll } = options;
    return (await repository.find({ filters, findAll })).length;
  }

  async delete(options: DeleteOptions): Promise<PersistanceDeleteResult<Entity>> {
    const { repository, store } = this;
    const { filters, forceTransaction, returnOriginalItems, transactionId } = options;
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.delete({ ...options, transactionId: tId });
      await store.endTransaction(tId);
      return result;
    }
    const { items: itemsToDelete } = await this.find({ filters, findAll: true, requirePrimaryKeys: true });
    const results: string[] = await repository.save(itemsToDelete, { delete: true, transactionId });
    const dataToReturn: PersistanceDeleteResult<Entity> = { count: results.length };
    if (returnOriginalItems) {
      dataToReturn.originalItems = itemsToDelete;
    }
    return dataToReturn;
  }

  async find(options: FindOptions): Promise<PersistanceFindResults<Entity>> {
    const { filters, getTotalCount = true, page: optPage, perPage: optPerPage, findAll: optFindAll } = options;
    const page = optPage ? parseInt(optPage as unknown as string, 10) : 1; // make sure it's truly a number - it could come as string from GET requests
    const perPage = optPerPage ? parseInt(optPerPage as unknown as string, 10) : 10; // same as above - must be a number
    const findAll = optFindAll === true || (optFindAll as unknown) === 'true';
    const findResults: PersistanceFindResults<Entity> = { page: 1, perPage: 0, items: [], more: false };
    if (!findAll) {
      findResults.page = page;
      findResults.perPage = perPage;
    }
    const items: Entity[] = await this.repository.find({ filters, findAll, page, perPage });
    if (findAll) {
      findResults.perPage = items.length;
    } else {
      if (items.length === perPage + 1) {
        items.pop();
        findResults.more = true;
      }
      if (getTotalCount) {
        findResults.totalCount = await this.count(options);
      }
    }
    findResults.items = items;
    return findResults;
  }

  async findOne(options: FindOneOptions): Promise<Entity | null> {
    const { filters } = options;
    const items: Entity[] = await this.repository.find({ filters, page: 1, perPage: 1 });
    return items[0] || null;
  }

  async update(data: Entity, options: UpdateOptions): Promise<PersistanceUpdateResult<Entity>> {
    const { repository, store } = this;
    const { filters, forceTransaction, returnData, returnOriginalItems, transactionId } = options;
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.update(data, { ...options, transactionId: tId });
      await store.endTransaction(tId);
      return result;
    }
    const dataToReturn: PersistanceUpdateResult<Entity> = {};
    const itemToUpdate = await this.findOne({ filters, requirePrimaryKeys: true });
    if (!itemToUpdate) {
      dataToReturn.count = 0;
      if (returnData) {
        dataToReturn.items = [];
      }
      if (returnOriginalItems) {
        dataToReturn.originalItems = [];
      }
      return dataToReturn;
    }
    const updateResult = await repository.save(merge(itemToUpdate, data) as unknown as Entity, { transactionId });
    dataToReturn.count = updateResult.length;
    if (returnData) {
      dataToReturn.items = updateResult;
    }
    if (returnOriginalItems) {
      dataToReturn.originalItems = [itemToUpdate];
    }
    return dataToReturn;
  }
}
