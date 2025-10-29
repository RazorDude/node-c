import { INestApplication, NestModule } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  AppConfig,
  AppConfigPersistanceRDB,
  ConfigProviderModuleOptions,
  ConfigProviderService,
  RDBType
} from './common/configProvider';

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
    console.info(`[Node-C]: Launching ${appModules.length} applications...`);
    const { apiModulesOptions, generateOrmConfig, generateOrmConfigModuleOptions, loadConfigOptions } = options || {};
    const apiModulesOptionsMap = new Map<string, string>();
    const apps: INestApplication<unknown>[] = [];
    let config: AppConfig | undefined;
    // generate the ormconfig.json files for the RDB persistance modules that use TypeOrm, such as MySQL and PostgreSQL
    if (loadConfigOptions) {
      console.info('[Node-C]: Loading configurations...');
      const { appConfigs, ...otherOptions } = loadConfigOptions;
      config = await ConfigProviderService.loadConfig(appConfigs, otherOptions);
      if (generateOrmConfig) {
        const moduleOptionsPerName = generateOrmConfigModuleOptions || {};
        const { persistance } = config;
        for (const moduleName in persistance) {
          const { type } = persistance[moduleName] as AppConfigPersistanceRDB;
          if (type === RDBType.ClickHouse || !Object.values(RDBType).includes(type as RDBType)) {
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
      console.info('[Node-C]: Configurations loaded.');
    }
    if (apiModulesOptions && apiModulesOptions.length) {
      apiModulesOptions.forEach(item => {
        apiModulesOptionsMap.set(`${item.appModuleIndex}`, item.apiModuleName);
      });
    }
    for (const i in appModules) {
      console.info(`[Node-C]: Preparing app module no. ${i}...`);
      // create the nest app from the module
      const apiModuleName = apiModulesOptionsMap.get(i);
      if (!apiModuleName) {
        console.info(`[Node-C][${i}]: No api module found. Creating standalone app...`);
        const app = await NestFactory.createApplicationContext(appModules[i]);
        apps.push(app as INestApplication);
        console.info(`[Node-C][${i}]: Standalone created successfully.`);
        continue;
      }
      console.info(`[Node-C][${i}]: Api module found. Creating network app...`);
      const app = await NestFactory.create(appModules[i], { bodyParser: false });
      console.info(`[Node-C]: Created a network app for module no ${i} (API module name "${apiModuleName}").`);
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
          console.info(`[Node-C][${i}/${apiModuleName}]: Starting listeners...`);
          await app.listen(port as number, hostname as string);
          console.info(`[NODE-C][${i}/${apiModuleName}] Server listening at ${hostname}:${port}.`);
        } else {
          console.info(`[Node-C][${i}/${apiModuleName}]: No listener configuration found.`);
        }
      } else {
        console.info(`[Node-C][${i}/${apiModuleName}]: No API config found.`);
      }
      apps.push(app as INestApplication);
    }
    return apps;
  }
}
