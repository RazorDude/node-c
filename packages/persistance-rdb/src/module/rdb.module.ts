import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { AppConfigPersistanceRDB, ConfigProviderService, loadDynamicModules } from '@node-c/core';

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
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreORM || []),
        TypeOrmModule.forRootAsync({
          useFactory: (configProvider: ConfigProviderService) => {
            const persistanceConfig = configProvider.config.persistance;
            // example : configProvider.config.persistance.db
            const { database, host, password, port, type, user } = persistanceConfig[
              moduleName as keyof typeof persistanceConfig
            ] as AppConfigPersistanceRDB;
            return {
              database,
              entities: entities as EntityClassOrSchema[],
              host,
              name: connectionName,
              password,
              port,
              type,
              username: user
            } as TypeOrmModuleOptions;
          },
          inject: [ConfigProviderService]
        }),
        SQLQueryBuilderModule.register({ persistanceModuleName: moduleName }),
        ...(importsPostORM || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      providers: [...(options.providers || [])],
      exports: [...(modules || []), ...(options.exports || [])]
    };
  }
}
