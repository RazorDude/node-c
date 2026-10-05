import type { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
  type AppConfigDataRDB,
  ConfigProviderService,
  LoggerService,
  loadDynamicModules,
  RDBType
} from '@node-c/core';
import { SQLQueryBuilderModule } from '@node-c/data-rdb';

import { DataSource, type DataSourceOptions } from 'typeorm';

import type { TypeORMDBModuleOptions } from './typeorm.module.definitions.js';

const RETRY_INTERVAL_MS = 60_000;

export class TypeORMDBModule {
  static register(options: TypeORMDBModuleOptions): DynamicModule {
    const {
      connectionName,
      folderData,
      imports: additionalImports,
      moduleClass,
      moduleName
    } = options;
    const {
      atEnd: importsAtEnd,
      postORM: importsPostORM,
      preORM: importsPreORM
    } = additionalImports || {};
    const { entities, modules } = loadDynamicModules(folderData, {
      moduleRegisterOptions: options.entityModuleRegisterOptions,
      registerOptionsPerModule: options.registerOptionsPerEntityModule
    });
    let lastRetryAt = Date.now();
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [
        ...(importsPreORM || []),
        TypeOrmModule.forRootAsync({
          dataSourceFactory: async (
            dsfOptions: DataSourceOptions | undefined
          ) => {
            const { failOnConnectionError = true, nodeCAppLoggerService } =
              (dsfOptions || {}) as {
                failOnConnectionError?: boolean;
                nodeCAppLoggerService: LoggerService;
              };
            let dataSource: DataSource;
            try {
              nodeCAppLoggerService.info(
                `[TypeORMDBModule][${moduleName}]: Connecting to the DB server...`
              );
              dataSource = new DataSource(dsfOptions!);
              await dataSource.initialize();
              nodeCAppLoggerService.info(
                `[TypeORMDBModule][${moduleName}]: Connected to the DB server successfully.`
              );
            } catch (err) {
              nodeCAppLoggerService.error(
                `[TypeORMDBModule][${moduleName}]: Error connecting to the DB server:`,
                err
              );
              if (failOnConnectionError) {
                throw err;
              }
            }
            return dataSource!;
          },
          name: connectionName,
          useFactory: (
            configProvider: ConfigProviderService,
            logger: LoggerService
          ) => {
            const dataConfig = configProvider.config.data;
            // example : configProvider.config.data.db
            const {
              database,
              failOnConnectionError,
              host,
              password,
              port,
              type,
              typeormExtraOptions,
              user
            } = dataConfig[
              moduleName as keyof typeof dataConfig
            ] as AppConfigDataRDB;
            const dataSourceOptions: {
              toRetry?: TypeOrmModuleOptions['toRetry'];
            } = {};
            if (!failOnConnectionError) {
              dataSourceOptions.toRetry = () => {
                const now = Date.now();
                // 1 minute retry interval
                if (Math.abs(lastRetryAt - now) > RETRY_INTERVAL_MS) {
                  lastRetryAt = now;
                  return true;
                }
                return false;
              };
            }
            return {
              ...dataSourceOptions,
              database,
              // entities: entities as EntityClassOrSchema[],
              entities,
              failOnConnectionError,
              host,
              manualInitialization: true,
              name: connectionName,
              nodeCAppLoggerService: logger,
              password,
              port,
              synchronize: false,
              type: type === RDBType.Aurora ? RDBType.MySQL : type,
              username: user,
              ...(typeormExtraOptions || {})
            } as TypeOrmModuleOptions;
          },
          inject: [ConfigProviderService, LoggerService]
        }),
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
