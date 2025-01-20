import { DynamicModule } from '@nestjs/common';

import { RedisModuleOptions } from './redis.module.definitions';

import { loadDynamicModules } from '../../../common/utils';
import { RedisStoreModule } from '../store';

export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass, moduleName, storeKey } = options;
    const { atEnd: importsAtEnd, postStore: importsPostStore, preStore: importsPreStore } = additionalImports || {};
    const { modules, services } = loadDynamicModules(folderData);
    console.log(services, modules);
    return {
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreStore || []),
        RedisStoreModule.register({ persistanceModuleName: moduleName, storeKey }),
        ...(importsPostStore || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      providers: [...(services || []), ...(options.providers || [])],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
