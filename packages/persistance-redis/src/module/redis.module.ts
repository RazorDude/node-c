import { DynamicModule } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';

import { RedisModuleOptions } from './redis.module.definitions';

import { RedisStoreModule } from '../store';

export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass, moduleName, storeKey } = options;
    const { atEnd: importsAtEnd, postStore: importsPostStore, preStore: importsPreStore } = additionalImports || {};
    const { modules } = loadDynamicModules(folderData);
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreStore || []),
        RedisStoreModule.register({ persistanceModuleName: moduleName, storeKey }),
        ...(importsPostStore || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      providers: [...(options.providers || [])],
      exports: [...(modules || []), ...(options.exports || [])]
    };
  }
}
