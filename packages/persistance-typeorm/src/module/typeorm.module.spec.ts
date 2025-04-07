import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { ConfigProviderService } from '@node-c/core';
import { SQLQueryBuilderModule } from '@node-c/persistance-rdb';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TypeORMModule } from './index';

// Dummy classes to use in tests.
class AtEndModule {}
// class DummyEntity {}
class DummyModule {}
class LoadedModule {}
class PostORMModule {}
class PreORMModule {}

describe('TypeORMModule.register', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it('should register a module with minimal options', () => {
    // const fakeEntities = [DummyEntity];
    const fakeLoadedModules = [LoadedModule];
    // Spy on SQLQueryBuilderModule.register and provide a dummy implementation.
    const sqlQueryRegisterSpy = vi
      .spyOn(SQLQueryBuilderModule, 'register')
      .mockImplementation((options: { persistanceModuleName: string }) => {
        return { module: 'SQLQueryBuilderModule', options } as unknown as DynamicModule;
      });
    const options = {
      connectionName: 'testConnection',
      folderData: {
        loadedModule: LoadedModule
      },
      moduleClass: DummyModule,
      moduleName: 'testModule'
    };
    const dynamicModule: DynamicModule = TypeORMModule.register(options);
    expect(dynamicModule.module).toBe(DummyModule);
    expect(dynamicModule.providers).toEqual([]);
    expect(dynamicModule.exports).toEqual(fakeLoadedModules);
    // The imports array is composed as:
    // [ ...preORM, TypeOrmModule.forRootAsync({ ... }), SQLQueryBuilderModule.register({ ... }), ...postORM, ...loadedModules, ...atEnd ]
    // Since no additional imports were provided, expect:
    //   index 0: TypeOrmModule.forRootAsync config
    //   index 1: SQLQueryBuilderModule.register result
    //   index 2: LoadedModule (from fakeLoadedModules)
    expect(dynamicModule.imports).toHaveLength(3);
    // Verify the TypeOrmModule.forRootAsync configuration.
    const typeOrmAsyncModule = dynamicModule.imports![0] as unknown as {
      imports: unknown[];
      module: TypeOrmModule;
      providers: unknown[];
    };
    expect(typeOrmAsyncModule.module).toBe(TypeOrmModule);
    expect((dynamicModule.imports![1] as unknown as { module: string }).module).toEqual('SQLQueryBuilderModule');
    // Verify that SQLQueryBuilderModule.register was called with the proper argument.
    expect(sqlQueryRegisterSpy).toHaveBeenCalledWith({ persistanceModuleName: 'testModule' });
    const sqlQueryModule = dynamicModule.imports![1];
    expect(sqlQueryModule).toEqual({
      module: 'SQLQueryBuilderModule',
      options: { persistanceModuleName: 'testModule' }
    });
    // Finally, check that the loaded module from loadDynamicModules is included.
    expect(dynamicModule.imports![2]).toBe(LoadedModule);
  });
  it('should register a module with additional imports, providers, and exports', () => {
    // const fakeEntities = [DummyEntity];
    const fakeLoadedModules = [LoadedModule];
    // Spy on SQLQueryBuilderModule.register.
    const sqlQueryRegisterSpy = vi
      .spyOn(SQLQueryBuilderModule, 'register')
      .mockImplementation((options: { persistanceModuleName: string }) => {
        return { module: 'SQLQueryBuilderModule', options } as unknown as DynamicModule;
      });
    const dummyProvider = { provide: 'DUMMY', useValue: 123 };
    const dummyExport = { export: 'DUMMY_EXPORT' } as unknown as DynamicModule;
    const options = {
      connectionName: 'customConnection',
      folderData: {
        loadedModule: LoadedModule
      },
      moduleClass: DummyModule,
      moduleName: 'customModule',
      providers: [dummyProvider],
      exports: [dummyExport],
      imports: {
        preORM: [PreORMModule],
        postORM: [PostORMModule],
        atEnd: [AtEndModule]
      }
    };
    const dynamicModule: DynamicModule = TypeORMModule.register(options);
    // Verify module and providers.
    expect(dynamicModule.module).toBe(DummyModule);
    expect(dynamicModule.providers).toEqual([dummyProvider]);
    // Exports should be the concatenation of loaded modules and provided exports.
    expect(dynamicModule.exports).toEqual([...fakeLoadedModules, dummyExport]);
    // Expected imports ordering:
    // index 0: PreORMModule (from imports.preORM)
    // index 1: TypeOrmModule.forRootAsync configuration
    // index 2: SQLQueryBuilderModule.register result
    // index 3: PostORMModule (from imports.postORM)
    // index 4: LoadedModule (from loadDynamicModules.modules)
    // index 5: AtEndModule (from imports.atEnd)
    expect(dynamicModule.imports).toHaveLength(6);
    expect(dynamicModule.imports![0]).toBe(PreORMModule);
    // const typeOrmAsyncModule = dynamicModule.imports![1] as unknown as {
    //   useFactory: (_configProvider: ConfigProviderService) => unknown;
    //   inject: unknown[];
    // };
    // expect(typeOrmAsyncModule.useFactory).toBeDefined();
    // expect(typeOrmAsyncModule.inject).toEqual([ConfigProviderService]);
    // Supply a fake config for customModule.
    // const fakeConfigProvider: ConfigProviderService = {
    //   config: {
    //     persistance: {
    //       customModule: {
    //         host: '192.168.1.100',
    //         password: 'topsecret',
    //         port: 27017
    //       }
    //     }
    //   }
    // } as unknown as ConfigProviderService;
    // const typeOrmConfig = typeOrmAsyncModule.useFactory(fakeConfigProvider);
    // expect(typeOrmConfig).toEqual({
    //   host: '192.168.1.100',
    //   password: 'topsecret',
    //   port: 27017,
    //   entities: fakeEntities,
    //   name: 'customConnection'
    // });
    // Verify SQLQueryBuilderModule.register call.
    expect(sqlQueryRegisterSpy).toHaveBeenCalledWith({ persistanceModuleName: 'customModule' });
    const sqlQueryModule = dynamicModule.imports![2];
    expect(sqlQueryModule).toEqual({
      module: 'SQLQueryBuilderModule',
      options: { persistanceModuleName: 'customModule' }
    });
    // Check the rest of the ordering.
    expect(dynamicModule.imports![3]).toBe(PostORMModule);
    expect(dynamicModule.imports![4]).toBe(LoadedModule);
    expect(dynamicModule.imports![5]).toBe(AtEndModule);
  });
});
