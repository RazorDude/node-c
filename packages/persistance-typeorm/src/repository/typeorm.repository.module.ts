import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { DataSource, ObjectLiteral } from 'typeorm';

import { TypeORMDBRepository } from './typeorm.repository';
import { TypeORMDBRepositoryModuleOptions } from './typeorm.repository.definitions';

@Module({})
export class TypeORMDBRepositoryModule {
  static register<Entity extends ObjectLiteral>(options: TypeORMDBRepositoryModuleOptions): DynamicModule {
    const { connectionName, entityClass, persistanceModuleName } = options;
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
          useFactory: (sqlQueryBuilderService: SQLQueryBuilderService) => sqlQueryBuilderService,
          inject: [`${persistanceModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`]
        },
        {
          provide: Constants.RDB_REPOSITORY_ENTITY_CLASS,
          useValue: entityClass
        },
        {
          provide: Constants.RDB_REPOSITORY_DATASOURCE,
          useFactory: (dataSource: DataSource) => dataSource,
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
          useFactory: (dataSource: DataSource) => dataSource,
          inject: [getDataSourceToken(connectionName)]
        }
      ]
    };
  }
}
