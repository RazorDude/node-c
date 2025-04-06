import { DynamicModule, Module } from '@nestjs/common';

import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { ObjectLiteral } from 'typeorm';

import { ClickhouseRepository } from './clickhouse.repository';
import { ClickhouseRepositoryModuleOptions } from './clickhouse.repository.definitions';

@Module({})
export class ClickhouseRepositoryModule {
  static register<Entity extends ObjectLiteral>(options: ClickhouseRepositoryModuleOptions): DynamicModule {
    const { connectionName, entityClass, persistanceModuleName } = options;
    return {
      module: ClickhouseRepositoryModule,
      imports: [],
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
          useValue: {}
          // useFactory: (dataSource: DataSource) => dataSource,
          // inject: [getDataSourceToken(connectionName)]
        },
        ClickhouseRepository<Entity>,
        {
          provide: Constants.RDB_ENTITY_REPOSITORY,
          useExisting: ClickhouseRepository<Entity>
        }
      ],
      exports: [
        SQLQueryBuilderService,
        {
          provide: Constants.RDB_ENTITY_REPOSITORY,
          useExisting: ClickhouseRepository<Entity>
        },
        {
          provide: Constants.RDB_REPOSITORY_DATASOURCE,
          useValue: {}
        }
      ]
    };
  }
}
