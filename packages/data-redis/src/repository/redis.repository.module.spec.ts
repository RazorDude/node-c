import { describe, expect, it } from 'vitest';

import { EntitySchema, RedisRepositoryModule, RedisRepositoryService } from './index';

import { Constants } from '../common/definitions';
import { RedisStoreService } from '../store';

interface ProviderObject {
  provide: unknown;
  useValue?: unknown;
  useFactory?: (_arg: unknown) => unknown;
  inject?: string[];
}

describe('RedisRepositoryModule', () => {
  const moduleName = 'test';
  const storeKey = 'test-store';

  describe('register', () => {
    const dummySchema: EntitySchema = { columns: {}, name: 'testSchema' };
    const options = { dataModuleName: moduleName, schema: dummySchema, storeKey };
    const dynamicModule = RedisRepositoryModule.register(options);
    const expectedStoreServiceToken = `${moduleName}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`;
    it('should return a dynamic module with the expected properties', () => {
      expect(dynamicModule.module).toBe(RedisRepositoryModule);
      expect(dynamicModule.imports).toEqual([]);
      expect(dynamicModule.providers).toHaveLength(4);
      expect(dynamicModule.exports).toEqual([RedisRepositoryService, RedisStoreService]);
    });
    it('should include a provider for Constants.REDIS_REPOSITORY_SCHEMA with useValue equal to schema', () => {
      const provider = dynamicModule.providers!.find(
        (p: unknown): p is ProviderObject =>
          typeof p === 'object' &&
          p !== null &&
          'provide' in p &&
          (p as ProviderObject).provide === Constants.REDIS_REPOSITORY_SCHEMA
      ) as ProviderObject | undefined;
      expect(provider).toBeDefined();
      expect(provider!.useValue).toEqual(dummySchema);
    });
    it('should include a provider for RedisStoreService with correct useFactory and inject', () => {
      const provider = dynamicModule.providers!.find(
        (p: unknown): p is ProviderObject =>
          typeof p === 'object' && p !== null && 'provide' in p && (p as ProviderObject).provide === RedisStoreService
      ) as ProviderObject | undefined;
      expect(provider).toBeDefined();
      expect(typeof provider!.useFactory).toBe('function');
      expect(provider!.inject).toEqual([expectedStoreServiceToken]);
      // Verify the useFactory function returns its input
      const dummyInstance: RedisStoreService = {} as RedisStoreService;
      const factoryResult = provider!.useFactory!(dummyInstance);
      expect(factoryResult).toBe(dummyInstance);
    });
    it('should include RedisRepositoryService as a provider', () => {
      // RedisRepositoryService is provided as a class (not an object provider)
      const providerExists = dynamicModule.providers!.some((p: unknown) => p === RedisRepositoryService);
      expect(providerExists).toBe(true);
    });
  });
});
