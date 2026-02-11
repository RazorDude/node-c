import { ClickHouseClient, createClient } from '@clickhouse/client';
import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config';
import { DynamicModule } from '@nestjs/common';

import { AppConfigDataRDB, ConfigProviderService } from '@node-c/core';

import { ClickHouseConnectionModuleOptions } from './clickhouse.connection.module.definitions';

import { Constants } from '../common/definitions';

export class ClickHouseConnectionModule {
  static register(options: ClickHouseConnectionModuleOptions): DynamicModule {
    const { dataModuleName } = options;
    const clientName = `${Constants.CLICKHOUSE_CLIENT_PREFIX}${dataModuleName}`;
    return {
      global: true,
      module: ClickHouseConnectionModule,
      imports: [],
      providers: [
        {
          provide: clientName,
          useFactory: async (configProvider: ConfigProviderService) => {
            const dataConfig = configProvider.config.data;
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
            } = dataConfig[dataModuleName as keyof typeof dataConfig] as AppConfigDataRDB;
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
              console.error(`[ClickHouseConnectionModule][${dataModuleName}]: Error connecting to ClickHouse:`, err);
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
