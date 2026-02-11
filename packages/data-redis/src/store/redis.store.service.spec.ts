import { AppConfig, ConfigProviderService } from '@node-c/core';
import { RedisClientType, createClient } from 'redis';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisStoreService, RedisTransaction } from './index';

interface TestAppConfig {
  data: Record<string, TestAppConfigDataNoSQL>;
}
interface TestAppConfigDataNoSQL {
  password?: string;
  host?: string;
  port?: number;
}

// Stub the createClient function from redis.
vi.mock('redis', () => {
  return {
    createClient: vi.fn()
  };
});
vi.mock('uuid', () => {
  return {
    v4: vi.fn().mockReturnValue('test-transaction-id')
  };
});

// TODO: unit tests with a real redis connection
describe('RedisStoreService', () => {
  const moduleName = 'test';
  const storeKey = 'test-store';
  const configProvider = {
    config: { data: { [moduleName]: { storeKey } } }
  } as unknown as ConfigProviderService;

  describe('constructor', () => {
    it('should create an instance of the class, set its transactions property to an empty object and set its storeKey correctly when called', () => {
      const service = new RedisStoreService(configProvider, {} as unknown as RedisClientType, 'test');
      expect((service as unknown as { transactions: unknown }).transactions).toEqual({});
    });
  });

  describe('createClient', () => {
    // Create a dummy client that only implements the connect method
    const dummyClient: RedisClientType = {
      connect: vi.fn().mockResolvedValue(undefined)
    } as unknown as RedisClientType;
    beforeEach(() => {
      vi.clearAllMocks();
      (createClient as unknown as Mock).mockReturnValue(dummyClient);
    });
    it('should create a client with provided config values', async () => {
      const config: TestAppConfig = {
        data: {
          testModule: {
            password: 'secret',
            host: 'localhost',
            port: 1234
          }
        }
      };
      const options = { dataModuleName: 'testModule' };
      const client = await RedisStoreService.createClient(config as unknown as AppConfig, options);
      expect(createClient).toHaveBeenCalledWith({
        password: 'secret',
        socket: { host: 'localhost', port: 1234 },
        username: 'default'
      });
      expect(dummyClient.connect).toHaveBeenCalled();
      expect(client).toBe(dummyClient);
    });
    it('should create a client with default host and port when not provided', async () => {
      const config: TestAppConfig = {
        data: {
          testModule: {
            // password, host, and port are omitted (or undefined)
            password: undefined,
            host: undefined,
            port: undefined
          }
        }
      };
      const options = { dataModuleName: 'testModule' };
      const client = await RedisStoreService.createClient(config as unknown as AppConfig, options);
      expect(createClient).toHaveBeenCalledWith({
        password: undefined,
        socket: { host: '0.0.0.0', port: 6379 },
        username: 'default'
      });
      expect(dummyClient.connect).toHaveBeenCalled();
      expect(client).toBe(dummyClient);
    });
  });

  describe('delete', () => {
    let dummyClient: RedisClientType;
    let service: RedisStoreService;
    beforeEach(() => {
      // Create a dummy Redis client with a mocked hDel method.
      dummyClient = {
        hDel: vi.fn()
      } as unknown as RedisClientType;
      // Instantiate the service with the dummy client and a test store key.
      service = new RedisStoreService(configProvider, dummyClient, moduleName);
    });
    it('should call client.hDel when no transactionId is provided', async () => {
      // Arrange: stub hDel to resolve with a number.
      const expectedResult = 5;
      (dummyClient.hDel as ReturnType<typeof vi.fn>).mockResolvedValue(expectedResult);
      const handle = 'testHandle';
      // Act: call the delete method without transactionId.
      const result = await service.delete(handle);
      // Assert: verify that the client.hDel method was called correctly and the result is returned.
      expect(dummyClient.hDel).toHaveBeenCalledWith(storeKey, handle);
      expect(result).toBe(expectedResult);
    });
    it('should throw an ApplicationError when transactionId is provided but no transaction is found', async () => {
      // Arrange: use a transactionId that is not in the transactions object.
      const handle = 'testHandle';
      const transactionId = 'nonExistentTransaction';
      // Act & Assert: expect the call to throw an ApplicationError with the correct message.
      await expect(service.delete(handle, { transactionId })).rejects.toThrow(
        `[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`
      );
    });
    it('should call transaction.hDel when transactionId is provided and transaction exists, then return 0', async () => {
      // Arrange: create a dummy transaction object with a mocked hDel method.
      const dummyTransaction = {
        hDel: vi.fn().mockReturnValue(42) // The actual return value is not used by delete.
      };
      const handle = 'testHandle';
      const transactionId = 'existingTransaction';
      // Inject the dummy transaction into the service's transactions map.
      service['transactions'][transactionId] = dummyTransaction as unknown as RedisTransaction;
      // Act: call delete with a valid transactionId.
      const result = await service.delete(handle, { transactionId });
      // Assert: verify that the transaction's hDel was called with the proper arguments.
      expect(dummyTransaction.hDel).toHaveBeenCalledWith(storeKey, handle);
      // Also verify that the transaction in the map is replaced with the result of hDel.
      expect(service['transactions'][transactionId]).toBe(42);
      // And the method returns 0 as specified.
      expect(result).toBe(0);
    });
  });

  describe('createTransaction', () => {
    const dummyTransaction = { transactionProp: 'dummyValue' };
    let dummyClient: RedisClientType;
    let service: RedisStoreService;
    beforeEach(() => {
      // Create a dummy client with a mocked multi method.
      dummyClient = {
        multi: vi.fn().mockReturnValue(dummyTransaction)
      } as unknown as RedisClientType;
      service = new RedisStoreService(configProvider, dummyClient, moduleName);
    });
    it('should create a transaction and store it in the transactions map', () => {
      const transactionId = service.createTransaction();
      // Verify that uuid was called and returned the constant value.
      expect(transactionId).toBe('test-transaction-id');
      // Verify that the client's multi method was called.
      expect(dummyClient.multi).toHaveBeenCalled();
      // Verify that the transaction is stored in the service's transactions map.
      expect(service['transactions'][transactionId]).toBe(dummyTransaction);
    });
  });

  describe('endTransaction', () => {
    let dummyClient: RedisClientType;
    let service: RedisStoreService;
    beforeEach(() => {
      // Create a dummy client. Its methods are not needed for endTransaction.
      dummyClient = {} as RedisClientType;
      service = new RedisStoreService(configProvider, dummyClient, moduleName);
    });
    it('should throw an ApplicationError when transaction does not exist', async () => {
      const transactionId = 'nonExistentTransaction';
      await expect(service.endTransaction(transactionId)).rejects.toThrow(
        `[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`
      );
    });
    it('should execute the transaction and remove it from transactions map', async () => {
      const dummyTransaction = {
        exec: vi.fn().mockResolvedValue(undefined)
      };
      const transactionId = 'existingTransaction';
      // Inject the dummy transaction into the transactions map.
      service['transactions'][transactionId] = dummyTransaction as unknown as RedisTransaction;
      await service.endTransaction(transactionId);
      expect(dummyTransaction.exec).toHaveBeenCalled();
      // After execution, the transaction should be removed.
      expect(service['transactions'][transactionId]).toBeUndefined();
    });
    it('should propagate error if exec rejects and not delete the transaction', async () => {
      const error = new Error('exec error');
      const dummyTransaction = {
        exec: vi.fn().mockRejectedValue(error)
      };
      const transactionId = 'failingTransaction';
      service['transactions'][transactionId] = dummyTransaction as unknown as RedisTransaction;
      await expect(service.endTransaction(transactionId)).rejects.toThrow(error);
      // The transaction remains since deletion happens only on successful exec.
      expect(service['transactions'][transactionId]).toBe(dummyTransaction);
    });
  });

  describe('get', () => {
    let dummyClient: RedisClientType;
    let service: RedisStoreService;
    beforeEach(() => {
      // Create a dummy Redis client with a mocked hGet method.
      dummyClient = {
        hGet: vi.fn()
      } as unknown as RedisClientType;
      service = new RedisStoreService(configProvider, dummyClient, moduleName);
    });
    it('should return the value as is when parseToJSON is not requested', async () => {
      const expectedValue = { foo: 'bar' };
      const handle = 'someKey';
      (dummyClient.hGet as ReturnType<typeof vi.fn>).mockResolvedValue(expectedValue);
      const result = await service.get<typeof expectedValue>(handle);
      expect(dummyClient.hGet).toHaveBeenCalledWith(storeKey, handle);
      expect(result).toEqual(expectedValue);
    });
    it('should return parsed JSON when parseToJSON is true and value is a string', async () => {
      const handle = 'jsonKey';
      const jsonString = '{"foo":"bar"}';
      const parsedValue = { foo: 'bar' };
      (dummyClient.hGet as ReturnType<typeof vi.fn>).mockResolvedValue(jsonString);
      const result = await service.get<typeof parsedValue>(handle, { parseToJSON: true });
      expect(dummyClient.hGet).toHaveBeenCalledWith(storeKey, handle);
      expect(result).toEqual(parsedValue);
    });
    it('should return the original value when parseToJSON is true but value is not a string', async () => {
      const expectedValue = 12345;
      const handle = 'nonStringKey';
      (dummyClient.hGet as ReturnType<typeof vi.fn>).mockResolvedValue(expectedValue);
      const result = await service.get<number>(handle, { parseToJSON: true });
      expect(dummyClient.hGet).toHaveBeenCalledWith(storeKey, handle);
      expect(result).toBe(expectedValue);
    });
  });

  describe('scan', () => {
    const handle = 'pattern';
    let dummyClient: RedisClientType;
    let service: RedisStoreService;
    beforeEach(() => {
      dummyClient = {
        hScan: vi.fn(),
        hScanNoValues: vi.fn()
      } as unknown as RedisClientType;
      service = new RedisStoreService(configProvider, dummyClient, moduleName);
    });
    it('should throw an error with the correct message when neither the "cursor" nor the "scanAll" options are provided', async () => {
      await expect(service.scan(handle, {})).rejects.toThrow(
        'The "count" options is required when the "findAll" options is not positive.'
      );
    });
    it('should scan all using hScan when scanAll is true and return unparsed values', async () => {
      // Simulate multiple iterations:
      // 1st call returns cursor 1 and one tuple.
      // 2nd call returns cursor 0 and another tuple.
      (dummyClient.hScan as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ cursor: 1, tuples: [{ field: 'f1', value: '10' }] })
        .mockResolvedValueOnce({ cursor: 0, tuples: [{ field: 'f2', value: '20' }] });
      const options = { scanAll: true, count: 1 };
      const result = await service.scan(handle, options);
      expect(dummyClient.hScan).toHaveBeenCalledTimes(2);
      expect(dummyClient.hScan).toHaveBeenNthCalledWith(1, storeKey, 0, { count: 1, match: handle });
      expect(dummyClient.hScan).toHaveBeenNthCalledWith(2, storeKey, 0, { count: 1, match: handle });
      // Since parseToJSON is not requested, the values are returned as is.
      expect(result).toEqual(['10', '20']);
    });
    it('should scan all using hScan and parse JSON values when parseToJSON is true', async () => {
      // Single iteration returning one tuple with a JSON string.
      (dummyClient.hScan as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        cursor: 0,
        tuples: [
          { field: 'f1', value: '{"a":1}' },
          { field: 'f2', value: 527 }
        ]
      });
      const options = { scanAll: true, count: 2, parseToJSON: true };
      const result = await service.scan(handle, options);
      expect(result).toEqual([{ a: 1 }, 527]);
    });
    it('should scan once using hScan when scanAll is false and return unparsed values', async () => {
      // Non-scanAll branch: simulate a single call with a provided cursor and tuples.
      (dummyClient.hScan as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        cursor: 0,
        tuples: [{ field: 'f1', value: '100' }]
      });
      const options = { cursor: 5, count: 3 };
      const result = await service.scan(handle, options);
      expect(dummyClient.hScan).toHaveBeenCalledWith(storeKey, 5, { count: 3, match: handle });
      expect(result).toEqual(['100']);
    });
    it('should scan once using hScan when scanAll is false and return empty result if no tuples', async () => {
      // Simulate a call returning keys (and no tuples).
      (dummyClient.hScan as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ cursor: 0, keys: ['key1', 'key2'] });
      const options = { cursor: 0, count: 2 };
      const result = await service.scan(handle, options);
      // In this branch, keys are returned but values remains empty, so the result is [].
      expect(result).toEqual([]);
    });
    it('should use hScanNoValues when withValues is false and return empty array (non-scanAll)', async () => {
      // For withValues false, the hScanNoValues method is used.
      (dummyClient.hScanNoValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ cursor: 0, keys: ['a', 'b'] });
      const options = { cursor: 0, count: 2, withValues: false };
      const result = await service.scan(handle, options);
      expect(dummyClient.hScanNoValues).toHaveBeenCalledWith(storeKey, 0, { count: 2, match: handle });
      // Since no tuples are provided, the result is an empty array.
      expect(result).toEqual([]);
    });
    it('should use hScanNoValues when withValues is false and scanAll is true, returning empty array', async () => {
      // For scanAll true with withValues false.
      (dummyClient.hScanNoValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ cursor: 0, keys: ['a'] });
      const options = { scanAll: true, count: 1, withValues: false };
      const result = await service.scan(handle, options);
      expect(dummyClient.hScanNoValues).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('set', () => {
    let dummyClient: RedisClientType;
    let service: RedisStoreService;
    beforeEach(() => {
      dummyClient = {
        hSet: vi.fn()
      } as unknown as RedisClientType;
      service = new RedisStoreService(configProvider, dummyClient, moduleName);
    });
    it('should set a non-string entry using client.hSet when no transactionId is provided and result is "OK"', async () => {
      const entry = { a: 1 };
      const handle = 'key1';
      const stringifiedEntry = JSON.stringify(entry);
      (dummyClient.hSet as ReturnType<typeof vi.fn>).mockResolvedValue('OK');
      await service.set(handle, entry);
      expect(dummyClient.hSet).toHaveBeenCalledWith(storeKey, handle, stringifiedEntry);
    });
    it('should set a string entry using client.hSet when no transactionId is provided and result is 1', async () => {
      const entry = 'string value';
      const handle = 'key2';
      (dummyClient.hSet as ReturnType<typeof vi.fn>).mockResolvedValue(1);
      await service.set(handle, entry);
      expect(dummyClient.hSet).toHaveBeenCalledWith(storeKey, handle, entry);
    });
    it('should throw an ApplicationError when client.hSet returns an unexpected result', async () => {
      const entry = 'some value';
      const handle = 'key3';
      (dummyClient.hSet as ReturnType<typeof vi.fn>).mockResolvedValue(0);
      await expect(service.set(handle, entry)).rejects.toThrow(
        `[RedisStoreService][Error]: Value not set for handle "${handle}". Result: 0`
      );
    });
    it('should throw an ApplicationError when a transactionId is provided but no transaction exists', async () => {
      const entry = { b: 2 };
      const handle = 'key4';
      const transactionId = 'txnNotExist';
      await expect(service.set(handle, entry, { transactionId })).rejects.toThrow(
        `[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`
      );
    });
    it('should set a non-string entry in a transaction when transactionId is provided and transaction exists', async () => {
      const dummyTransaction = {
        hSet: vi.fn().mockReturnValue('dummyReturn')
      };
      const entry = { b: 2 };
      const handle = 'key5';
      const stringifiedEntry = JSON.stringify(entry);
      const transactionId = 'txn1';
      service['transactions'][transactionId] = dummyTransaction as unknown as RedisTransaction;
      await service.set(handle, entry, { transactionId });
      expect(dummyTransaction.hSet).toHaveBeenCalledWith(storeKey, handle, stringifiedEntry);
      expect(service['transactions'][transactionId]).toBe('dummyReturn');
    });
    it('should set a string entry in a transaction when transactionId is provided and transaction exists', async () => {
      const dummyTransaction = {
        hSet: vi.fn().mockReturnValue('transactionReturn')
      };
      const entry = 'simple string';
      const handle = 'key6';
      const transactionId = 'txn2';
      service['transactions'][transactionId] = dummyTransaction as unknown as RedisTransaction;
      await service.set(handle, entry, { transactionId });
      expect(dummyTransaction.hSet).toHaveBeenCalledWith(storeKey, handle, entry);
      expect(service['transactions'][transactionId]).toBe('transactionReturn');
    });
  });
});
