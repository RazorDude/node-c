import { ClickHouseClient, createClient } from '@clickhouse/client';
import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config';
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
          useFactory: async (configProvider: ConfigProviderService) => {
            const persistanceConfig = configProvider.config.persistance;
            const {
              application,
              database,
              failOnConnectionError = true,
              host,
              password,
              port,
              protocol,
              requestTimeout,
              useHostParam,
              user
            } = persistanceConfig[persistanceModuleName as keyof typeof persistanceConfig] as AppConfigPersistanceRDB;
            const connectionOptions: NodeClickHouseClientConfigOptions = {
              database,
              password,
              username: user
            };
            const url = `${protocol || 'http'}://${host}:${port}`;
            let client: ClickHouseClient;
            if (application) {
              connectionOptions.application = application;
            }
            if (requestTimeout) {
              connectionOptions.request_timeout = requestTimeout;
            }
            if (useHostParam) {
              connectionOptions.host = url;
            } else {
              connectionOptions.url = url;
            }
            try {
              client = createClient(connectionOptions);
              const pingResult = await client.ping({ select: true });
              if (!pingResult.success) {
                throw new Error(JSON.stringify(pingResult));
              }
            } catch (err) {
              console.error(
                `[ClickHouseConnectionModule][${persistanceModuleName}]: Error connecting to ClickHouse:`,
                err
              );
              if (failOnConnectionError) {
                throw err;
              }
            }
            return client!;
          },
          inject: [ConfigProviderService]
        }
      ],
      exports: [clientName]
    };
  }
}
