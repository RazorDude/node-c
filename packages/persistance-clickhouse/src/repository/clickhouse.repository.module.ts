import { ClickHouseClient } from '@clickhouse/client';
import { DynamicModule, Module } from '@nestjs/common';

import { GenericObject } from '@node-c/core';
import { Constants as RDBConstants, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { ClickHouseDBRepository } from './clickhouse.repository';
import { ClickHouseDBRepositoryModuleOptions } from './clickhouse.repository.definitions';

import { Constants } from '../common/definitions';
import { ClickHouseEntityManager } from '../entityManager';

@Module({})
export class ClickHouseDBRepositoryModule {
  static register<Entity extends GenericObject<unknown>>(
    options: ClickHouseDBRepositoryModuleOptions<Entity>
  ): DynamicModule {
    const { entitySchema, persistanceModuleName } = options;
    const clientName = `${Constants.CLICKHOUSE_CLIENT_PREFIX}${persistanceModuleName}`;
    return {
      module: ClickHouseDBRepositoryModule,
      providers: [
        {
          provide: SQLQueryBuilderService,
          useFactory: (sqlQueryBuilderService: SQLQueryBuilderService) => sqlQueryBuilderService,
          inject: [`${persistanceModuleName}${RDBConstants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`]
        },
        {
          provide: Constants.CLICKHOUSE_CLIENT,
          useFactory: (clickhouseClient: ClickHouseClient) => clickhouseClient,
          inject: [clientName]
        },
        {
          provide: RDBConstants.RDB_REPOSITORY_ENTITY_CLASS,
          useValue: entitySchema
        },
        ClickHouseEntityManager,
        ClickHouseDBRepository<Entity>,
        {
          provide: RDBConstants.RDB_ENTITY_REPOSITORY,
          useExisting: ClickHouseDBRepository<Entity>
        }
      ],
      exports: [
        SQLQueryBuilderService,
        {
          provide: RDBConstants.RDB_ENTITY_REPOSITORY,
          useExisting: ClickHouseDBRepository<Entity>
        },
        {
          provide: Constants.CLICKHOUSE_CLIENT,
          useFactory: (clickhouseClient: ClickHouseClient) => clickhouseClient,
          inject: [clientName]
        }
      ]
    };
  }
}
