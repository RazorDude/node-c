import { INestApplication, NestModule, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';

import { AppConfig, ConfigProviderModuleOptions, ConfigProviderService, RDBType } from './common/configProvider';

export interface NodeCAppStartOptions {
  apiModulesOptions?: { appModuleIndex: number; apiModuleName: string }[];
  generateOrmConfig?: boolean;
  generateOrmConfigModuleOptions?: {
    [moduleName: string]: {
      entitiesPathInModule: string;
      migrationsPathInModule: string;
      modulePathInProject: string;
    };
  };
  loadConfigOptions?: ConfigProviderModuleOptions;
}

export class NodeCApp {
  // TODO: start each server in a different process
  static async start(appModules: NestModule[], options?: NodeCAppStartOptions): Promise<INestApplication<unknown>[]> {
    const { apiModulesOptions, generateOrmConfig, generateOrmConfigModuleOptions, loadConfigOptions } = options || {};
    const apiModulesOptionsMap = new Map<string, string>();
    const apps: INestApplication<unknown>[] = [];
    let config: AppConfig | undefined;
    // generate the ormconfig.json files for the RDB persistance modules that use TypeOrm, such as MySQL and PostgreSQL
    if (loadConfigOptions) {
      const { appConfigs, ...otherOptions } = loadConfigOptions;
      config = await ConfigProviderService.loadConfig(appConfigs, otherOptions);
      if (generateOrmConfig) {
        const moduleOptionsPerName = generateOrmConfigModuleOptions || {};
        const { persistance } = config;
        for (const moduleName in persistance) {
          const { type } = persistance[moduleName];
          if (!Object.values(RDBType).includes(type as RDBType)) {
            continue;
          }
          await ConfigProviderService.generateOrmconfig(config, {
            ...(moduleOptionsPerName[moduleName] || {
              entitiesPathInModule: 'entities',
              migrationsPathInModule: 'migrations',
              modulePathInProject: `src/persistance/${moduleName}`,
              seedsPathInModule: 'seeds'
            }),
            moduleName
          });
        }
      }
    }
    if (apiModulesOptions && apiModulesOptions.length) {
      apiModulesOptions.forEach(item => {
        apiModulesOptionsMap.set(`${item.appModuleIndex}`, item.apiModuleName);
      });
    }
    for (const i in appModules) {
      // create the nest app from the main module
      const app = await NestFactory.create(appModules[i], { bodyParser: false });
      const apiModuleName = apiModulesOptionsMap.get(i);
      if (!apiModuleName) {
        apps.push(app);
        continue;
      }
      if (!config) {
        config = app.get(ConfigProviderService).config;
      }
      const { api: apiConfigs } = config;
      const apiConfig = apiConfigs[apiModuleName];
      // start an API server, if requested in the options
      if (apiConfig) {
        // configure logging
        app.use(morgan('tiny'));
        app.useGlobalPipes(
          new ValidationPipe({
            whitelist: true
          })
        );
        const { hostname, port } = apiConfig;
        if (hostname && port) {
          await app.listen(port as number, hostname as string);
          console.info(`[API.${apiModuleName}] Server listening at ${hostname}:${port}.`);
        }
      }
      apps.push(app);
    }
    return apps;
  }
}
