import { DynamicModule, Provider } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ProviderWithInjectionToken, loadDynamicModules } from './utils.loadDynamicModules';

import { GenericObject } from '../../definitions';

describe('loadDynamicModules', () => {
  it('should return undefined for all arrays if folderData is empty', () => {
    const result = loadDynamicModules({});
    expect(result.controllers).toBeUndefined();
    expect(result.entities).toBeUndefined();
    expect(result.modules).toBeUndefined();
    expect(result.services).toBeUndefined();
  });
  it('should skip keys matching /^base(.+)?$/', () => {
    const folderData: GenericObject<unknown> = {
      base: { name: 'base' },
      baseExtra: { name: 'baseExtra' },
      UserController: { name: 'UserController' }
    };
    const result = loadDynamicModules(folderData);
    // Only "UserController" should be processed.
    expect(result.controllers).toHaveLength(1);
  });
  it('should process keys ending with "Controller" and add injection token mapping when provided', () => {
    const controllerWithToken = {
      injectionToken: 'TOKEN_Controller',
      name: 'MyController'
    } as ProviderWithInjectionToken;
    const controllerWithoutToken = {
      name: 'OtherController'
    } as ProviderWithInjectionToken;
    const folderData: GenericObject<unknown> = {
      MyController: controllerWithToken,
      OtherController: controllerWithoutToken
    };
    const result = loadDynamicModules(folderData);
    // For controller keys, if injectionToken is present, the function pushes a mapped provider and then the original.
    expect(result.controllers).toHaveLength(3);
    // Verify that one of the controllers is an object with a "provide" property matching the injection token.
    const tokenProviders = result.controllers?.filter(c => typeof c === 'object' && 'provide' in c) as Provider[];
    expect(tokenProviders).toHaveLength(1);
    expect(tokenProviders[0]).toHaveProperty('provide', 'TOKEN_Controller');
  });
  it('should process keys ending with "Entity"', () => {
    const entity1 = { id: 1 };
    const entity2 = { id: 2 };
    const folderData: GenericObject<unknown> = {
      UserEntity: entity1,
      OrderEntity: entity2
    };
    const result = loadDynamicModules(folderData);
    expect(result.entities).toHaveLength(2);
    expect(result.entities).toEqual([entity1, entity2]);
  });
  it('should process keys ending with "Module" as DynamicModule', () => {
    const module1: DynamicModule = { module: (() => {}) as unknown as DynamicModule['module'] };
    const module2: DynamicModule = { module: (() => {}) as unknown as DynamicModule['module'] };
    const folderData: GenericObject<unknown> = {
      AppModule: module1,
      FeatureModule: module2
    };
    const result = loadDynamicModules(folderData);
    expect(result.modules).toHaveLength(2);
    expect(result.modules).toEqual([module1, module2]);
  });
  it('should process keys ending with "Service" and add injection token mapping when provided', () => {
    const serviceWithToken = {
      injectionToken: 'TOKEN_Service',
      name: 'MyService'
    } as ProviderWithInjectionToken;
    const serviceWithoutToken = {
      name: 'OtherService'
    } as ProviderWithInjectionToken;
    const folderData: GenericObject<unknown> = {
      MyService: serviceWithToken,
      OtherService: serviceWithoutToken
    };
    const result = loadDynamicModules(folderData);
    // Expect two entries for MyService (mapped + original) and one for OtherService.
    expect(result.services).toHaveLength(3);
    const tokenProviders = result.services?.filter(s => typeof s === 'object' && 'provide' in s) as Provider[];
    expect(tokenProviders).toHaveLength(1);
    expect(tokenProviders[0]).toHaveProperty('provide', 'TOKEN_Service');
  });
  it('should ignore keys that do not match any expected pattern', () => {
    const folderData: GenericObject<unknown> = {
      RandomKey: { data: 123 },
      AnotherKey: { data: 'abc' }
    };
    const result = loadDynamicModules(folderData);
    expect(result.controllers).toBeUndefined();
    expect(result.entities).toBeUndefined();
    expect(result.modules).toBeUndefined();
    expect(result.services).toBeUndefined();
  });
  it('should be case-insensitive for the first letter when matching patterns', () => {
    const folderData: GenericObject<unknown> = {
      usercontroller: { name: 'lowerCaseController' },
      OrderEntity: { id: 10 },
      Featuremodule: { module: (() => {}) as unknown as DynamicModule['module'] },
      paymentService: { name: 'mixedService' }
    };
    const result = loadDynamicModules(folderData);
    expect(result.controllers).toHaveLength(1);
    expect(result.entities).toHaveLength(1);
    expect(result.modules).toHaveLength(1);
    expect(result.services).toHaveLength(1);
  });
});
