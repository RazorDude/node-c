import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { AppConfigPersistanceRDB, ConfigProviderService, RDBType, loadDynamicModules } from '@node-c/core';
import { SQLQueryBuilderModule } from '@node-c/persistance-rdb';

import { DataSource } from 'typeorm';

import { TypeORMDBModuleOptions } from './typeorm.module.definitions';

export class TypeORMDBModule {
  static register(options: TypeORMDBModuleOptions): DynamicModule {
    const { connectionName, folderData, imports: additionalImports, moduleClass, moduleName } = options;
    const { atEnd: importsAtEnd, postORM: importsPostORM, preORM: importsPreORM } = additionalImports || {};
    const { entities, modules } = loadDynamicModules(folderData, {
      moduleRegisterOptions: options.entityModuleRegisterOptions,
      registerOptionsPerModule: options.registerOptionsPerEntityModule
    });
    let lastRetryAt = new Date().valueOf();
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreORM || []),
        TypeOrmModule.forRootAsync({
          dataSourceFactory: async options => {
            let dataSource: DataSource;
            try {
              dataSource = new DataSource(options!);
              await dataSource.initialize();
            } catch (err) {
              console.error(`[TypeORMDBModule][${moduleName}]: Error connecting to the DB Server:`, err);
              const { failOnConnectionError = true } = (options || {}) as { failOnConnectionError?: boolean };
              if (failOnConnectionError) {
                throw err;
              }
            }
            return dataSource!;
          },
          name: connectionName,
          useFactory: (configProvider: ConfigProviderService) => {
            const persistanceConfig = configProvider.config.persistance;
            // example : configProvider.config.persistance.db
            const { database, failOnConnectionError, host, password, port, type, typeormExtraOptions, user } =
              persistanceConfig[moduleName as keyof typeof persistanceConfig] as AppConfigPersistanceRDB;
            const dataSourceOptions: { toRetry?: TypeOrmModuleOptions['toRetry'] } = {};
            if (!failOnConnectionError) {
              dataSourceOptions.toRetry = () => {
                const now = new Date().valueOf();
                // 1 minute retry interval
                if (Math.abs(lastRetryAt - now) > 60000) {
                  lastRetryAt = now;
                  return true;
                }
                return false;
              };
            }
            return {
              ...dataSourceOptions,
              database,
              entities: entities as EntityClassOrSchema[],
              failOnConnectionError,
              host,
              manualInitialization: true,
              name: connectionName,
              password,
              port,
              synchronize: false,
              type: type === RDBType.Aurora ? RDBType.MySQL : type,
              username: user,
              ...(typeormExtraOptions || {})
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
