/** biome-ignore-all lint/suspicious/noConsole: No other logging method at startup. */

import { DynamicModule, HttpStatus, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  type AppConfig,
  type AppConfigDataRDB,
  type ConfigProviderModuleOptions,
  RDBType
} from './common/configProvider/configProvider.definitions.js';
import { ConfigProviderService } from './common/configProvider/configProvider.service.js';
import { LoggerService } from './common/logger/logger.service.js';

// not included in Nest's HttpStatus enum
const HTTP_STATUS_REQUEST_HEADER_FIELDS_TOO_LARGE = 431;

export interface NodeCAppGenerateOrmConfigModuleOptions {
  [moduleName: string]: {
    entitiesPathInModule: string;
    migrationsPathInModule: string;
    modulePathInProject: string;
  };
}

export interface NodeCAppStartOptions {
  apiModulesOptions?: { appModuleIndex: number; apiModuleName: string }[];
  generateOrmConfig?: boolean;
  generateOrmConfigModuleOptions?: NodeCAppGenerateOrmConfigModuleOptions;
  loadConfigOptions?: ConfigProviderModuleOptions;
}

export class NodeCApp {
  // TODO: start each server in a different process
  static async start(
    appModules: DynamicModule[],
    options?: NodeCAppStartOptions
  ): Promise<INestApplication<unknown>[]> {
    console.info(`[Node-C]: Launching ${appModules.length} applications...`);
    const {
      apiModulesOptions,
      generateOrmConfig,
      generateOrmConfigModuleOptions,
      loadConfigOptions
    } = options || {};
    const apiModulesOptionsMap = new Map<string, string>();
    const apps: INestApplication<unknown>[] = [];
    let config: AppConfig | undefined;
    // generate the ormconfig.json files for the RDB data modules that use TypeOrm, such as MySQL and PostgreSQL
    if (loadConfigOptions) {
      console.info('[Node-C]: Loading configurations...');
      const { appConfigs, ...otherOptions } = loadConfigOptions;
      config = await ConfigProviderService.loadConfig(appConfigs, otherOptions);
      if (generateOrmConfig) {
        const moduleOptionsPerName = generateOrmConfigModuleOptions || {};
        const { data } = config;
        for (const moduleName in data) {
          const { type } = data[moduleName] as AppConfigDataRDB;
          if (
            type === RDBType.ClickHouse ||
            !Object.values(RDBType).includes(type as RDBType)
          ) {
            continue;
          }
          await ConfigProviderService.generateOrmconfig(config, {
            ...(moduleOptionsPerName[moduleName] || {
              entitiesPathInModule: 'entities',
              migrationsPathInModule: 'migrations',
              modulePathInProject: `src/data/${moduleName}`,
              seedsPathInModule: 'seeds'
            }),
            moduleName
          });
        }
      }
      console.info('[Node-C]: Configurations loaded.');
    }
    if (apiModulesOptions?.length) {
      apiModulesOptions.forEach((item) => {
        apiModulesOptionsMap.set(`${item.appModuleIndex}`, item.apiModuleName);
      });
    }
    for (const i in appModules) {
      console.info(`[Node-C]: Preparing app module no. ${i}...`);
      // create the nest app from the module
      const apiModuleName = apiModulesOptionsMap.get(i);
      if (!apiModuleName) {
        console.info(
          `[Node-C][${i}]: No api module found. Creating standalone app...`
        );
        const app = await NestFactory.createApplicationContext(appModules[i]);
        app.useLogger(app.get(LoggerService));
        apps.push(app as INestApplication);
        console.info(`[Node-C][${i}]: Standalone created successfully.`);
        continue;
      }
      console.info(`[Node-C][${i}]: Api module found. Creating network app...`);
      const app = await NestFactory.create(appModules[i], {
        bodyParser: false
      });
      app.useLogger(app.get(LoggerService));
      console.info(
        `[Node-C]: Created a network app for module no ${i} (API module name "${apiModuleName}").`
      );
      // TODO: starting the network app will potentially cause problems, so we can't rely on the config being loaded after the app
      if (!config) {
        config = app.get(ConfigProviderService).config;
      }
      const { api: apiConfigs } = config;
      const apiConfig = apiConfigs[apiModuleName];
      // start an API server, if requested in the options
      if (apiConfig) {
        const { hostname, port } = apiConfig;
        if (hostname && port) {
          console.info(
            `[Node-C][${i}/${apiModuleName}]: Starting listeners...`
          );
          // TODO: move the following app.set and app.use to the http module
          // fix the problem where query is immutable in expressjs v5+
          (app as unknown as { set: (...args: unknown[]) => void }).set(
            'query parser',
            'extended'
          );
          app.use(
            (req: { query: unknown }, _res: unknown, next: () => void) => {
              Object.defineProperty(req, 'query', {
                ...Object.getOwnPropertyDescriptor(req, 'query'),
                value: req.query,
                writable: true
              });
              next();
            }
          );
          // handle client errors so that we don't wonder what happenhd and why we're getting 400 or 431 without a body
          app.getHttpServer().on(
            'clientError',
            (
              err:
                | {
                    code?: string;
                    message?: string;
                    rawPacket?: Buffer;
                    reason?: string;
                  }
                | undefined,
              socket: {
                destroy: () => void;
                end: (message: string) => void;
                writable: boolean;
              }
            ) => {
              app.get(LoggerService).error({
                errorCode: err?.code,
                errorReason: err?.reason ?? err?.message,
                errorType: 'clientError'
                // won't be logging this for now, cause we could have auth headers and other unsanitize things here
                // rawPacket: err?.rawPacket?.toString()
              });
              // the client has already disconnected - nothing to respond to
              if (err?.code === 'ECONNRESET' || !socket.writable) {
                socket.destroy();
                return;
              }
              let statusCode: number;
              let statusText: string;
              if (err?.code === 'HPE_HEADER_OVERFLOW') {
                statusCode = HTTP_STATUS_REQUEST_HEADER_FIELDS_TOO_LARGE;
                statusText = 'Request Header Fields Too Large';
              } else {
                statusCode = HttpStatus.BAD_REQUEST;
                statusText = 'Bad Request';
              }
              // don't include the rawPacket in the response, as it may contain credentials
              const body = JSON.stringify({
                error: statusText,
                message: err?.code,
                statusCode
              });
              socket.end(
                `HTTP/1.1 ${statusCode} ${statusText}\r\n` +
                  'Content-Type: application/json; charset=utf-8\r\n' +
                  `Content-Length: ${Buffer.byteLength(body)}\r\n` +
                  'Connection: close\r\n' +
                  '\r\n' +
                  body
              );
            }
          );
          await app.listen(port as number, hostname as string);
          console.info(
            `[NODE-C][${i}/${apiModuleName}] Server listening at ${hostname}:${port}.`
          );
        } else {
          console.info(
            `[Node-C][${i}/${apiModuleName}]: No listener configuration found.`
          );
        }
      } else {
        console.info(`[Node-C][${i}/${apiModuleName}]: No API config found.`);
      }
      apps.push(app as INestApplication);
    }
    return apps;
  }
}
