import { DynamicModule } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';
import { SQLQueryBuilderModule } from '@node-c/data-rdb';

import { ClickHouseDBModuleOptions } from './clickhouse.module.definitions';

import { ClickHouseConnectionModule } from '../connectionModule';

export class ClickHouseDBModule {
  static register(options: ClickHouseDBModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass, moduleName } = options;
    const { atEnd: importsAtEnd, postORM: importsPostORM, preORM: importsPreORM } = additionalImports || {};
    const { modules } = loadDynamicModules(folderData, {
      moduleRegisterOptions: options.entityModuleRegisterOptions,
      registerOptionsPerModule: options.registerOptionsPerEntityModule
    });
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreORM || []),
        ClickHouseConnectionModule.register({ dataModuleName: moduleName }),
        SQLQueryBuilderModule.register({ dataModuleName: moduleName }),
        ...(importsPostORM || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      providers: [...(options.providers || [])],
      exports: [...(modules || []), ...(options.exports || [])]
    };
  }
}
