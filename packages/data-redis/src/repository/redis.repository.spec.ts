import { AppConfigDataNoSQL, ApplicationError, ConfigProviderService } from '@node-c/core';

import classValidator from 'class-validator';
import { mergeDeepRight } from 'ramda';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  EntitySchema,
  EntitySchemaColumnType,
  PrepareOptions,
  RedisRepositoryService,
  SaveOptions,
  SaveOptionsOnConflict
} from './index';

import { Constants } from '../common/definitions';
import { RedisStoreService } from '../store';

interface DummyFindOptions {
  exactSearch?: boolean;
  filters?: Record<string, string>;
  findAll: boolean;
  page?: number;
  perPage?: number;
  withValues?: boolean;
}

class TestRedisRepositoryService<Entity> extends RedisRepositoryService<Entity> {
  public exposePrepare(data: Entity, options?: PrepareOptions) {
    return this.prepare(data, options);
  }
}

describe('RedisRepositoryService', () => {
  const moduleName = 'test';
  const storeKey = 'test-store';
  const configProvider = {
    config: { data: { [moduleName]: { storeKey } } }
  } as unknown as ConfigProviderService;
  let dummySchema: EntitySchema;
  let dummyStore: RedisStoreService;
  let repository: RedisRepositoryService<unknown>;

  beforeEach(() => {
    delete (configProvider.config.data[moduleName] as AppConfigDataNoSQL).storeDelimiter;
    // Create a dummy schema with two primary key columns: 'id' and 'code'
    dummySchema = {
      name: 'TestEntity',
      columns: {
        id: { primary: true, primaryOrder: 0 },
        code: { primary: true, primaryOrder: 1 },
        description: { primary: false }
      }
    };
    dummyStore = {
      scan: vi.fn()
    } as unknown as RedisStoreService;
    // Instantiate the repository service with the dummy schema and store.
    repository = new RedisRepositoryService(
      configProvider,
      moduleName,
      dummySchema,
      dummyStore as unknown as RedisStoreService
    );
  });

  describe('constructor', () => {
    it('should throw an error if a primary key does not have the primaryOrder field provided in it for the config', () => {
      // Access the protected primaryKeys property using a type assertion.
      let errorMessage: string;
      try {
        new RedisRepositoryService(
          configProvider,
          moduleName,
          {
            ...dummySchema,
            columns: { ...dummySchema.columns, id: { ...dummySchema.columns.id, primaryOrder: undefined } }
          },
          dummyStore
        );
      } catch (err) {
        errorMessage = (err as ApplicationError).message;
      }
      expect(errorMessage!).toEqual(
        'At schema "TestEntity", column "id": the field "primaryOrder" is required for primary key columns.'
      );
    });
    it('should extract primary keys from the provided schema and set the storeDelimiter to the default, if none is provided in the config', () => {
      // Access the protected primaryKeys property using a type assertion.
      const primaryKeys = (repository as unknown as { primaryKeys: string[] }).primaryKeys;
      const storeDelimiter = (repository as unknown as { storeDelimiter: string[] }).storeDelimiter;
      expect(primaryKeys).toEqual(['id', 'code']);
      expect(storeDelimiter).toEqual(Constants.DEFAULT_STORE_DELIMITER);
    });
    it('should extract primary keys from the provided schema and set the storeDelimiter correctly, if one is provided in the config', () => {
      (configProvider.config.data[moduleName] as AppConfigDataNoSQL).storeDelimiter = ':';
      repository = new RedisRepositoryService(
        configProvider,
        moduleName,
        dummySchema,
        dummyStore as unknown as RedisStoreService
      );
      // Access the protected primaryKeys property using a type assertion.
      const primaryKeys = (repository as unknown as { primaryKeys: string[] }).primaryKeys;
      const storeDelimiter = (repository as unknown as { storeDelimiter: string[] }).storeDelimiter;
      expect(primaryKeys).toEqual(['id', 'code']);
      expect(storeDelimiter).toEqual(':');
    });
  });

  describe('find', () => {
    it('should return results when filters are provided with pagination options', async () => {
      // Set up dummy scan to return a resolved array.
      (dummyStore.scan as ReturnType<typeof vi.fn>).mockResolvedValue(['result1', 'result2']);
      const options: DummyFindOptions = {
        filters: { id: '123', code: 'XYZ' },
        findAll: false,
        page: 2,
        perPage: 50
      };
      const result = await repository.find(options);
      // The storeEntityKey is computed as '-' + ["123", "XYZ"].join('-') === "-123-XYZ"
      // The full key becomes "TestEntity-123-XYZ"
      // Pagination: count = perPage (50), cursor = (page - 1) * count = 50.
      expect(dummyStore.scan).toHaveBeenCalledWith('TestEntity-123-XYZ', {
        count: 50,
        cursor: 50,
        scanAll: false,
        withValues: true
      });
      expect(result).toEqual(['result1', 'result2']);
    });
    it('should throw an error when exactSearch is true and a required primary key is missing', async () => {
      // Provide filters that are missing a value for one primary key.
      const options: DummyFindOptions = {
        filters: { id: '123' }, // missing 'code'
        exactSearch: true,
        findAll: false
      };
      await expect(repository.find(options)).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Find Error]: The primary key field code is required when exactSearch is set to true.'
      );
    });
    it('should call scan with a * key when some filters are not provided and exactSearch is not true', async () => {
      (dummyStore.scan as ReturnType<typeof vi.fn>).mockResolvedValue(['resultAll']);
      const options: DummyFindOptions = {
        filters: { id: '123' }, // missing 'code'
        findAll: true,
        withValues: false
      };
      const result = await repository.find(options);
      // Key should be just "TestEntity" and options merged with {}.
      expect(dummyStore.scan).toHaveBeenCalledWith('TestEntity-123-*', { scanAll: true, withValues: false });
      expect(result).toEqual(['resultAll']);
    });
    it('should call scan with the entity name when filters are not provided and findAll is true', async () => {
      // When filters is undefined and findAll is true, storeEntityKey remains empty.
      (dummyStore.scan as ReturnType<typeof vi.fn>).mockResolvedValue(['resultAll']);
      const options: DummyFindOptions = {
        findAll: true,
        withValues: false
      };
      const result = await repository.find(options);
      // Key should be just "TestEntity" and options merged with {}.
      expect(dummyStore.scan).toHaveBeenCalledWith('TestEntity', { scanAll: true, withValues: false });
      expect(result).toEqual(['resultAll']);
    });
    it('should throw an error when neither filters are provided nor findAll is true', async () => {
      // Filters is undefined and findAll is false.
      const options: DummyFindOptions = {
        findAll: false
      };
      // Expect an error regarding missing filters or findAll.
      await expect(repository.find(options)).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Error]: Either filters or findAll is required when calling the find method.'
      );
    });
    it('should use default pagination options when page and perPage are not provided', async () => {
      // Filters provided but without page or perPage.
      (dummyStore.scan as ReturnType<typeof vi.fn>).mockResolvedValue(['defaultPaginatedResult']);
      const options: DummyFindOptions = {
        filters: { id: 'abc', code: 'def' },
        findAll: false
      };
      const result = await repository.find(options);
      // The computed storeEntityKey: '-' + ["abc", "def"].join('-') = "-abc-def"
      // Key becomes "TestEntity-abc-def". Pagination defaults: count = 100 and cursor = 0.
      expect(dummyStore.scan).toHaveBeenCalledWith('TestEntity-abc-def', {
        count: 100,
        cursor: 0,
        scanAll: false,
        withValues: true
      });
      expect(result).toEqual(['defaultPaginatedResult']);
    });
    it('should compute withValues as false when explicitly provided', async () => {
      // Filters provided with withValues set to false.
      (dummyStore.scan as ReturnType<typeof vi.fn>).mockResolvedValue(['resultWithFalse']);
      const options: DummyFindOptions = {
        filters: { id: '1', code: '2' },
        findAll: false,
        withValues: false
      };
      const result = await repository.find(options);
      // storeEntityKey: '-' + ["1", "2"] = "-1-2", key = "TestEntity-1-2"
      expect(dummyStore.scan).toHaveBeenCalledWith('TestEntity-1-2', {
        count: 100,
        cursor: 0,
        scanAll: false,
        withValues: false
      });
      expect(result).toEqual(['resultWithFalse']);
    });
  });

  describe('prepare', () => {
    let dummySchema: EntitySchema;
    let dummyStore: RedisStoreService;
    let repository: TestRedisRepositoryService<unknown>;
    beforeEach(() => {
      dummySchema = { name: 'TestEntity', columns: { id: { primary: true, primaryOrder: 0, generated: false } } };
      dummyStore = { get: vi.fn(), set: vi.fn() } as unknown as RedisStoreService;
      repository = new TestRedisRepositoryService(configProvider, moduleName, dummySchema, dummyStore);
    });
    it('returns prepared data and storeEntityKey for non-generated PK when value exists', async () => {
      const data = { id: 'abc' };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const result = await repository.exposePrepare(data);
      expect(result.data).toEqual(data);
      expect(result.storeEntityKey).toEqual('abc');
    });
    it('returns prepared data and storeEntityKey for generated PK when value exists', async () => {
      dummySchema = { name: 'TestEntity', columns: { id: { primary: true, primaryOrder: 0, generated: true } } };
      repository = new TestRedisRepositoryService(configProvider, moduleName, dummySchema, dummyStore);
      const data = { id: 'abc' };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const result = await repository.exposePrepare(data);
      expect(result.data).toEqual(data);
      expect(result.storeEntityKey).toEqual('abc');
    });
    it('throws error for non-generated PK when value is missing', async () => {
      await expect(repository.exposePrepare({})).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Validation Error]: A value is required for non-generated PK column id'
      );
    });
    it('throws error for generated PK when value is missing and generatePrimaryKeys is false', async () => {
      dummySchema.columns = {
        id: { primary: true, primaryOrder: 0, generated: true, type: EntitySchemaColumnType.Integer }
      };
      const options: PrepareOptions = { generatePrimaryKeys: false };
      await expect(repository.exposePrepare({}, options)).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Validation Error]: A value is required for generated PK column id when the generatePrimaryKeys is set to false.'
      );
    });
    it('throws error for generated PK when the column type is not supported for generation', async () => {
      dummySchema = {
        name: 'TestEntity',
        columns: { id: { primary: true, primaryOrder: 0, generated: true, type: EntitySchemaColumnType.String } }
      };
      repository = new TestRedisRepositoryService(configProvider, moduleName, dummySchema, dummyStore);
      await expect(repository.exposePrepare({}, { generatePrimaryKeys: true })).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Validation Error]: Unrecognized type "string" for PK column id'
      );
    });
    it('generates integer PK when missing and generatePrimaryKeys is true and the redis store returns a value', async () => {
      dummySchema.columns = {
        id: { primary: true, primaryOrder: 0, generated: true, type: EntitySchemaColumnType.Integer }
      };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue(5);
      const options: PrepareOptions = { generatePrimaryKeys: true };
      const result = await repository.exposePrepare({}, options);
      expect((result.data as { id: string }).id).toEqual(6);
      expect(result.storeEntityKey).toEqual('6');
      expect(dummyStore.set).toHaveBeenCalledWith('TestEntity-increment-id', 6);
    });
    it('generates integer PK when missing and generatePrimaryKeys is true and the store does not return a value', async () => {
      dummySchema.columns = {
        id: { primary: true, primaryOrder: 0, generated: true, type: EntitySchemaColumnType.Integer }
      };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const options: PrepareOptions = { generatePrimaryKeys: true };
      const result = await repository.exposePrepare({}, options);
      expect((result.data as { id: string }).id).toEqual(1);
      expect(result.storeEntityKey).toEqual('1');
      expect(dummyStore.set).toHaveBeenCalledWith('TestEntity-increment-id', 1);
    });
    it('generates UUIDV4 PK when missing and generatePrimaryKeys is true', async () => {
      dummySchema.columns = {
        id: { primary: true, primaryOrder: 0, generated: true, type: EntitySchemaColumnType.UUIDV4 }
      };
      const options: PrepareOptions = { generatePrimaryKeys: true };
      const result = await repository.exposePrepare({}, options);
      const resultData = result.data as { id: string };
      expect(resultData.id).toHaveLength(36);
      expect(resultData.id.match(/\-/)).toBe(null);
      expect(result.storeEntityKey).toHaveLength(36);
      expect(result.storeEntityKey.match(/\-/)).toBe(null);
    });
    it('throws validation error when optValidate is true and validate returns errors', async () => {
      const data = { id: 'value' };
      const validateSpy = vi.spyOn(classValidator, 'validate').mockResolvedValue([{ property: 'id' }]);
      const options: PrepareOptions = { validate: true };
      await expect(repository.exposePrepare(data, options)).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Validation Error]:'
      );
      validateSpy.mockRestore();
    });
    it('throws unique error when onConflict is ThrowError and existing entry exists', async () => {
      dummySchema.columns = { id: { primary: true, primaryOrder: 0, generated: false } };
      const data = { id: 'unique' };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue('existing');
      const options: PrepareOptions = { onConflict: SaveOptionsOnConflict.ThrowError };
      await expect(repository.exposePrepare(data, options)).rejects.toThrow(
        '[RedisRepositoryService TestEntity][Unique Error]: An entry already exists for key unique.'
      );
    });
    it('merges data when onConflict is Update and existing entry exists', async () => {
      dummySchema.columns = { id: { primary: true, primaryOrder: 0, generated: false }, name: { primary: false } };
      const data = { id: 'unique', name: 'new' };
      const existingData = { id: 'unique', name: 'old', extra: 'x' };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue(JSON.stringify(existingData));
      const options: PrepareOptions = { onConflict: SaveOptionsOnConflict.Update };
      const result = await repository.exposePrepare(data, options);
      const expected = mergeDeepRight(existingData, data);
      expect(result.data).toEqual(expected);
      expect(result.storeEntityKey).toEqual('unique');
    });
    it('throws error when onConflict has invalid value', async () => {
      dummySchema.columns = { id: { primary: true, primaryOrder: 0, generated: false } };
      const data = { id: 'unique' };
      (dummyStore.get as ReturnType<typeof vi.fn>).mockResolvedValue('existing');
      const options: PrepareOptions = { onConflict: 'invalidConflict' as SaveOptionsOnConflict };
      await expect(repository.exposePrepare(data, options)).rejects.toThrow(
        'Invalid value "invalidConflict" provided for onConflict.'
      );
    });
  });

  describe('save', () => {
    let dummySchema: EntitySchema;
    let dummyStore: RedisStoreService;
    let repository: TestRedisRepositoryService<unknown>;
    beforeEach(() => {
      dummySchema = { name: 'TestEntity', columns: { id: { primary: true, primaryOrder: 0, generated: false } } };
      dummyStore = {
        delete: vi.fn().mockResolvedValue(0),
        get: vi.fn().mockResolvedValue(undefined),
        set: vi.fn().mockResolvedValue(undefined)
      } as unknown as RedisStoreService;
      repository = new TestRedisRepositoryService(configProvider, moduleName, dummySchema, dummyStore);
    });
    it('calls delete branch when options.delete is true', async () => {
      const data = { id: 'abc', value: 123 };
      const options: SaveOptions = { delete: true, transactionId: 'txn1' };
      const result = await repository.save(data, options);
      expect(dummyStore.delete).toHaveBeenCalledWith(['abc'], { transactionId: 'txn1' });
      expect(result).toEqual(['abc']);
    });
    it('saves data normally when no options are provided', async () => {
      const data = { id: 'xyz', value: 'test' };
      const result = await repository.save(data);
      expect(dummyStore.set).toHaveBeenCalledWith('TestEntity-xyz', data, { transactionId: undefined });
      expect(result).toEqual([data]);
    });
    it('saves data normally when delete option is not provided (single entity)', async () => {
      const data = { id: 'xyz', value: 'test' };
      const options: SaveOptions = { transactionId: 'txn2' };
      const result = await repository.save(data, options);
      expect(dummyStore.set).toHaveBeenCalledWith('TestEntity-xyz', data, { transactionId: 'txn2' });
      expect(result).toEqual([data]);
    });
    it('saves data normally when delete option is not provided (multiple entities)', async () => {
      const dataArray = [
        { id: '1', value: 'a' },
        { id: '2', value: 'b' }
      ];
      const options: SaveOptions = { transactionId: 'txn3' };
      const result = await repository.save(dataArray, options);
      expect(dummyStore.set).toHaveBeenCalledWith('TestEntity-1', dataArray[0], { transactionId: 'txn3' });
      expect(dummyStore.set).toHaveBeenCalledWith('TestEntity-2', dataArray[1], { transactionId: 'txn3' });
      expect(result).toEqual(dataArray);
    });
  });
});
