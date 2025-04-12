import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { AppConfigPersistanceRDB, ConfigProviderService, loadDynamicModules } from '@node-c/core';
import { SQLQueryBuilderModule } from '@node-c/persistance-rdb';

import { TypeORMDBModuleOptions } from './typeorm.module.definitions';

export class TypeORMDBModule {
  static register(options: TypeORMDBModuleOptions): DynamicModule {
    const { connectionName, folderData, imports: additionalImports, moduleClass, moduleName } = options;
    const { atEnd: importsAtEnd, postORM: importsPostORM, preORM: importsPreORM } = additionalImports || {};
    const { entities, modules } = loadDynamicModules(folderData);
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreORM || []),
        TypeOrmModule.forRootAsync({
          name: connectionName,
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
