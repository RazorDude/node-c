import {
  ApplicationError,
  GenericObject,
  PersistanceDeleteResult,
  PersistanceEntityService,
  PersistanceFindResults,
  PersistanceUpdateResult,
  ProcessObjectAllowedFieldsType
} from '@node-c/core';

import { mergeDeepRight as merge } from 'ramda';

import {
  BulkCreateOptions,
  BulkCreatePrivateOptions,
  CountOptions,
  CountPrivateOptions,
  CreateOptions,
  CreatePrivateOptions,
  DeleteOptions,
  DeletePrivateOptions,
  FindOneOptions,
  FindOnePrivateOptions,
  FindOptions,
  FindPrivateOptions,
  RedisEntityServiceSettings,
  UpdateOptions,
  UpdatePrivateOptions
} from './redis.entity.service.definitions';

import { RedisRepositoryService } from '../repository';
import { RedisStoreService } from '../store';

// TODO: support "pseudo-relations"
// TODO: support update of multiple items in the update method
export class RedisEntityService<Entity extends object> extends PersistanceEntityService<Entity> {
  protected settings: RedisEntityServiceSettings;

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected repository: RedisRepositoryService<Entity>,
    // eslint-disable-next-line no-unused-vars
    protected store: RedisStoreService
  ) {
    super();
  }

  async bulkCreate(
    data: Entity[],
    options?: BulkCreateOptions,
    privateOptions?: BulkCreatePrivateOptions
  ): Promise<Entity[]> {
    const { store } = this;
    const actualOptions = options || {};
    const actualPrivateOptions = privateOptions || {};
    const { forceTransaction, transactionId } = actualOptions;
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.bulkCreate(data, { ...actualOptions, transactionId: tId }, actualPrivateOptions);
      await store.endTransaction(tId);
      return result;
    }
    const { processInputAllowedFieldsEnabled, validate } = actualPrivateOptions;
    return (await this.save(data, {
      processObjectAllowedFieldsEnabled: processInputAllowedFieldsEnabled,
      transactionId,
      validate
    })) as Entity[];
  }

  async create(data: Entity, options?: CreateOptions, privateOptions?: CreatePrivateOptions): Promise<Entity> {
    const { store } = this;
    const actualOptions = options || {};
    const actualPrivateOptions = privateOptions || {};
    const { forceTransaction, transactionId } = actualOptions;
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.create(data, { ...actualOptions, transactionId: tId }, actualPrivateOptions);
      await store.endTransaction(tId);
      return result;
    }
    const { processInputAllowedFieldsEnabled, validate } = actualPrivateOptions;
    return (
      (await this.save(data, {
        processObjectAllowedFieldsEnabled: processInputAllowedFieldsEnabled,
        transactionId,
        validate
      })) as Entity[]
    )[0];
  }

  async count(options: CountOptions, privateOptions?: CountPrivateOptions): Promise<number | undefined> {
    const { repository } = this;
    const { filters, findAll } = options;
    const { processFiltersAllowedFieldsEnabled } = privateOptions || {};
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters || {}, {
      allowedFields: repository.columnNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!Object.keys(parsedFilters).length) {
      throw new ApplicationError('At least one filter field for counting is required.');
    }
    return (await repository.find({ filters: parsedFilters, findAll })).length;
  }

  async delete(
    options: DeleteOptions,
    privateOptions?: DeletePrivateOptions
  ): Promise<PersistanceDeleteResult<Entity>> {
    const { repository, store } = this;
    const { filters, forceTransaction, returnOriginalItems, transactionId } = options;
    const actualPrivateOptions = privateOptions || {};
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.delete({ ...options, transactionId: tId }, actualPrivateOptions);
      await store.endTransaction(tId);
      return result;
    }
    const { processFiltersAllowedFieldsEnabled, requirePrimaryKeys = true } = actualPrivateOptions;
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters, {
      allowedFields: repository.columnNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!Object.keys(parsedFilters).length) {
      throw new ApplicationError('At least one filter field for deleting data is required.');
    }
    const { items: itemsToDelete } = await this.find({ filters, findAll: true }, { requirePrimaryKeys });
    const results: string[] = await this.save(itemsToDelete, {
      delete: true,
      transactionId
    });
    const dataToReturn: PersistanceDeleteResult<Entity> = { count: results.length };
    if (returnOriginalItems) {
      dataToReturn.originalItems = itemsToDelete;
    }
    return dataToReturn;
  }

  async find(options: FindOptions, privateOptions?: FindPrivateOptions): Promise<PersistanceFindResults<Entity>> {
    const { repository } = this;
    const { filters, getTotalCount = true, page: optPage, perPage: optPerPage, findAll: optFindAll } = options;
    const { processFiltersAllowedFieldsEnabled, requirePrimaryKeys } = privateOptions || {};
    // make sure it's truly a number - it could come as string from GET requests
    const page = optPage ? parseInt(optPage as unknown as string, 10) : 1;
    // same as above - must be a number
    const perPage = optPerPage ? parseInt(optPerPage as unknown as string, 10) : 10;
    const findAll = optFindAll === true || (optFindAll as unknown) === 'true';
    const findResults: PersistanceFindResults<Entity> = { page: 1, perPage: 0, items: [], more: false };
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters || {}, {
      allowedFields: repository.columnNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!findAll) {
      findResults.page = page;
      findResults.perPage = perPage;
    }
    const items: Entity[] = await repository.find(
      { filters: parsedFilters, findAll, page, perPage },
      { requirePrimaryKeys }
    );
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

  async findOne(options: FindOneOptions, privateOptions?: FindOnePrivateOptions): Promise<Entity | null> {
    const { filters } = options;
    const { processFiltersAllowedFieldsEnabled, requirePrimaryKeys } = privateOptions || {};
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters, {
      allowedFields: this.repository.columnNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!Object.keys(parsedFilters).length) {
      throw new ApplicationError('At least one filter field is required for the findOne method.');
    }
    const items: Entity[] = await this.repository.find({ filters, page: 1, perPage: 1 }, { requirePrimaryKeys });
    return items[0] || null;
  }

  protected async save<Data = unknown, ReturnData = unknown>(
    data: Data,
    options?: {
      delete?: boolean;
      processObjectAllowedFieldsEnabled?: boolean;
      transactionId?: string;
      validate?: boolean;
    }
  ): Promise<ReturnData> {
    const { repository } = this;
    const { delete: optDelete, processObjectAllowedFieldsEnabled, transactionId, validate } = options || {};
    if (optDelete) {
      return (await repository.save(data as unknown as Entity, {
        delete: true,
        transactionId,
        validate: false
      })) as ReturnData;
    }
    const dataToSave: Data | Data[] = await this.processObjectAllowedFields<Data>(data, {
      allowedFields: repository.columnNames,
      isEnabled: processObjectAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Input
    });
    return (await repository.save(dataToSave as Entity, { transactionId, validate })) as ReturnData;
  }

  async update(
    data: Entity,
    options: UpdateOptions,
    privateOptions?: UpdatePrivateOptions
  ): Promise<PersistanceUpdateResult<Entity>> {
    const { settings, store } = this;
    const { validationEnabled = false } = settings;
    const { filters, forceTransaction, returnData, returnOriginalItems, transactionId } = options;
    const actualPrivateOptions = privateOptions || {};
    if (!transactionId && forceTransaction) {
      const tId = store.createTransaction();
      const result = await this.update(data, { ...options, transactionId: tId }, actualPrivateOptions);
      await store.endTransaction(tId);
      return result;
    }
    const {
      processFiltersAllowedFieldsEnabled,
      processInputAllowedFieldsEnabled,
      requirePrimaryKeys = true,
      validate
    } = actualPrivateOptions;
    const dataToReturn: PersistanceUpdateResult<Entity> = {};
    const itemToUpdate = await this.findOne({ filters }, { processFiltersAllowedFieldsEnabled, requirePrimaryKeys });
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
    const updateResult = await this.save<Entity, Entity[]>(merge(itemToUpdate, data) as unknown as Entity, {
      processObjectAllowedFieldsEnabled: processInputAllowedFieldsEnabled,
      transactionId,
      validate: validate || validationEnabled
    });
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
