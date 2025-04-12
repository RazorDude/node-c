import { ClickHouseClient } from '@depyronick/nestjs-clickhouse';
import { DynamicModule } from '@nestjs/common';

import { AppConfigPersistanceRDB, ConfigProviderService } from '@node-c/core';

import { ClickHouseConnectionModuleOptions } from './clickhouse.connection.module.definitions';

import { Constants } from '../common/definitions';

export class ClickHouseConnectionModule {
  static register(options: ClickHouseConnectionModuleOptions): DynamicModule {
    const { persistanceModuleName } = options;
    const clientName = `${Constants.CLICKHOUSE_CLIENT_PREFIX}${persistanceModuleName}`;
    return {
      global: true,
      module: ClickHouseConnectionModule,
      imports: [],
      providers: [
        {
          provide: clientName,
          useFactory: (configProvider: ConfigProviderService) => {
            const persistanceConfig = configProvider.config.persistance;
            const { database, host, password, port, user } = persistanceConfig[
              persistanceModuleName as keyof typeof persistanceConfig
            ] as AppConfigPersistanceRDB;
            return new ClickHouseClient({
              database,
              host,
              name: clientName,
              password,
              port,
              username: user
            });
          },
          inject: [ConfigProviderService]
        }
      ],
      exports: [clientName]
    };
  }
}
