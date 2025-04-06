import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';

import { DataSource, ObjectLiteral } from 'typeorm';

import { RDBRepository } from './rdb.repository';
import { RDBRepositoryModuleOptions } from './rdb.repository.definitions';

import { Constants } from '../common/definitions';
import { SQLQueryBuilderService } from '../sqlQueryBuilder';

@Module({})
export class RDBRepositoryModule {
  static register<Entity extends ObjectLiteral>(options: RDBRepositoryModuleOptions): DynamicModule {
    const { connectionName, entityClass, persistanceModuleName } = options;
    return {
      module: RDBRepositoryModule,
      imports: [TypeOrmModule.forFeature([entityClass], connectionName)],
      providers: [
        {
          provide: Constants.RDB_REPOSITORY_CONNECTION_NAME,
          useValue: connectionName
        },
        {
          provide: SQLQueryBuilderService,
          useFactory: (redisStoreService: SQLQueryBuilderService) => redisStoreService,
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
        RDBRepository<Entity>,
        {
          provide: Constants.RDB_ENTITY_REPOSITORY,
          useExisting: RDBRepository<Entity>
        }
      ],
      exports: [
        TypeOrmModule,
        SQLQueryBuilderService,
        {
          provide: Constants.RDB_ENTITY_REPOSITORY,
          useExisting: RDBRepository<Entity>
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
