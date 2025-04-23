import { DynamicModule } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';

import { RedisModuleOptions } from './redis.module.definitions';

import { RedisStoreModule } from '../store';

export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass, moduleName } = options;
    const { atEnd: importsAtEnd, postStore: importsPostStore, preStore: importsPreStore } = additionalImports || {};
    const { modules } = loadDynamicModules(folderData, {
      moduleRegisterOptions: options.entityModuleRegisterOptions,
      registerOptionsPerModule: options.registerOptionsPerEntityModule
    });
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreStore || []),
        RedisStoreModule.register({ persistanceModuleName: moduleName }),
        ...(importsPostStore || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      providers: [...(options.providers || [])],
      exports: [...(modules || []), ...(options.exports || [])]
    };
  }
}
