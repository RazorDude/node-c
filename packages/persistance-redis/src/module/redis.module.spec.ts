import { loadDynamicModules } from '@node-c/core';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisModule, RedisModuleOptions } from './index';

import { RedisStoreModule } from '../store';

vi.mock('@node-c/core', () => ({
  loadDynamicModules: vi.fn()
}));
vi.mock('../store', () => ({
  RedisStoreModule: {
    register: vi.fn()
  }
}));

describe('RedisModule', () => {
  describe('register', () => {
    const dummyModules = ['moduleA', 'moduleB'];
    const dummyStoreDynamic = { module: 'StoreModule', global: false };
    const dummyModuleClass = class TestModule {};
    beforeEach(() => {
      (loadDynamicModules as unknown as Mock).mockReturnValue({ modules: dummyModules });
      (RedisStoreModule.register as unknown as Mock).mockReturnValue(dummyStoreDynamic);
    });
    it('should return dynamic module with all additionalImports and options provided', () => {
      const additionalImports = {
        preStore: ['pre1', 'pre2'],
        postStore: ['post1'],
        atEnd: ['end1']
      };
      const options = {
        folderData: 'dummyFolder',
        imports: additionalImports,
        moduleClass: dummyModuleClass,
        moduleName: 'testModule',
        storeKey: 'store123',
        providers: ['prov1'],
        exports: ['exp1']
      } as unknown as RedisModuleOptions;
      const result = RedisModule.register(options);
      expect(result.global).toBe(true);
      expect(result.module).toBe(dummyModuleClass);
      expect(result.imports).toEqual([
        ...additionalImports.preStore,
        dummyStoreDynamic,
        ...additionalImports.postStore,
        ...dummyModules,
        ...additionalImports.atEnd
      ]);
      expect(result.providers).toEqual(['prov1']);
      expect(result.exports).toEqual([...dummyModules, 'exp1']);
      expect(RedisStoreModule.register).toHaveBeenCalledWith({
        persistanceModuleName: options.moduleName,
        storeKey: options.storeKey
      });
      expect(loadDynamicModules).toHaveBeenCalledWith(options.folderData);
    });
    it('should return dynamic module when additionalImports, providers, and exports are undefined', () => {
      const options = {
        folderData: 'dummyFolder',
        moduleClass: dummyModuleClass,
        moduleName: 'testModule',
        storeKey: 'store123'
      } as unknown as RedisModuleOptions;
      (loadDynamicModules as unknown as Mock).mockReturnValue({ modules: undefined });
      const result = RedisModule.register(options);
      expect(result.global).toBe(true);
      expect(result.module).toBe(dummyModuleClass);
      expect(result.imports).toEqual([
        ...(undefined || []),
        dummyStoreDynamic,
        ...(undefined || []),
        ...(undefined || []),
        ...(undefined || [])
      ]);
      expect(result.providers).toEqual([]);
      expect(result.exports).toEqual([...(undefined || []), ...(undefined || [])]);
    });
  });
});
