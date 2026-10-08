import type { ClickHouseClient } from '@clickhouse/client';
import { type DynamicModule, Module } from '@nestjs/common';

import type { GenericObject } from '@node-c/core';
import {
  Constants as RDBConstants,
  SQLQueryBuilderService
} from '@node-c/data-rdb';

import { Constants } from '../common/definitions/common.constants.js';
import { ClickHouseEntityManager } from '../entityManager/clickhouse.entity.manager.js';

import type { ClickHouseDBRepositoryModuleOptions } from './clickhouse.repository.definitions.js';
import { ClickHouseDBRepository } from './clickhouse.repository.js';

@Module({})
export class ClickHouseDBRepositoryModule {
  static register<Entity extends GenericObject<unknown>>(
    options: ClickHouseDBRepositoryModuleOptions<Entity>
  ): DynamicModule {
    const { entitySchema, dataModuleName } = options;
    const clientName = `${Constants.CLICKHOUSE_CLIENT_PREFIX}${dataModuleName}`;
    return {
      module: ClickHouseDBRepositoryModule,
      providers: [
        {
          provide: SQLQueryBuilderService,
          useFactory: (
            sqlQueryBuilderService: SQLQueryBuilderService
          ): SQLQueryBuilderService => sqlQueryBuilderService,
          inject: [
            `${dataModuleName}${RDBConstants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`
          ]
        },
        {
          provide: Constants.CLICKHOUSE_CLIENT,
          useFactory: (clickhouseClient: ClickHouseClient): ClickHouseClient =>
            clickhouseClient,
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
          useFactory: (clickhouseClient: ClickHouseClient): ClickHouseClient =>
            clickhouseClient,
          inject: [clientName]
        }
      ]
    };
  }
}
