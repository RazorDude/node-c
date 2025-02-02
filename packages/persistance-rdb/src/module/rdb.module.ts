import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { ConfigProviderService, loadDynamicModules } from '@node-c/core';

import { RDBModuleOptions } from './rdb.module.definitions';

import { SQLQueryBuilderModule } from '../sqlQueryBuilder';

// Note: the services here do not have a wrapping module intentionally - because of how TypeORM imports them,
// we want to have all of them in a single module, to be used as an array in TypeOrmModule.forRootAsync
export class RDBModule {
  static register(options: RDBModuleOptions): DynamicModule {
    const { connectionName, folderData, imports: additionalImports, moduleClass, moduleName } = options;
    const { atEnd: importsAtEnd, postORM: importsPostORM, preORM: importsPreORM } = additionalImports || {};
    const { entities, modules } = loadDynamicModules(folderData);
    return {
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreORM || []),
        TypeOrmModule.forRootAsync({
          useFactory: (configProvider: ConfigProviderService) => {
            const persistanceConfig = configProvider.config.persistance;
            // example : configProvider.config.persistance.db
            const { host, password, port } = persistanceConfig[moduleName as keyof typeof persistanceConfig];
            return Object.assign(
              {},
              { host, password, port },
              { entities: entities as EntityClassOrSchema[], name: connectionName }
            );
          },
          inject: [ConfigProviderService]
        }),
        SQLQueryBuilderModule.register({ dbConfigPath: `config.persistance.${moduleName}` }),
        ...(importsPostORM || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      // providers: [...(options.providers || []), ...(services || [])],
      providers: [...(options.providers || [])],
      // exports: [...(services || []), ...(options.exports || [])]
      exports: [...(modules || []), ...(options.exports || [])]
    };
  }
}
