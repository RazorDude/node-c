import { type DynamicModule, Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';

import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';

import type { DataSource, ObjectLiteral } from 'typeorm';

import type { TypeORMDBRepositoryModuleOptions } from './typeorm.repository.definitions.js';
import { TypeORMDBRepository } from './typeorm.repository.js';

@Module({})
export class TypeORMDBRepositoryModule {
  static register<Entity extends ObjectLiteral>(
    options: TypeORMDBRepositoryModuleOptions
  ): DynamicModule {
    const { connectionName, entityClass, dataModuleName } = options;
    return {
      module: TypeORMDBRepositoryModule,
      imports: [TypeOrmModule.forFeature([entityClass], connectionName)],
      providers: [
        {
          provide: Constants.RDB_REPOSITORY_CONNECTION_NAME,
          useValue: connectionName
        },
        {
          provide: SQLQueryBuilderService,
          useFactory: (
            sqlQueryBuilderService: SQLQueryBuilderService
          ): SQLQueryBuilderService => sqlQueryBuilderService,
          inject: [
            `${dataModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`
          ]
        },
        {
          provide: Constants.RDB_REPOSITORY_ENTITY_CLASS,
          useValue: entityClass
        },
        {
          provide: Constants.RDB_REPOSITORY_DATASOURCE,
          useFactory: (dataSource: DataSource): DataSource => dataSource,
          inject: [getDataSourceToken(connectionName)]
        },
        TypeORMDBRepository<Entity>,
        {
          provide: Constants.RDB_ENTITY_REPOSITORY,
          useExisting: TypeORMDBRepository<Entity>
        }
      ],
      exports: [
        TypeOrmModule,
        SQLQueryBuilderService,
        {
          provide: Constants.RDB_ENTITY_REPOSITORY,
          useExisting: TypeORMDBRepository<Entity>
        },
        {
          provide: Constants.RDB_REPOSITORY_DATASOURCE,
          useFactory: (dataSource: DataSource): DataSource => dataSource,
          inject: [getDataSourceToken(connectionName)]
        }
      ]
    };
  }
}
