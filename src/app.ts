import * as path from 'path';

import { INestApplication, NestModule, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';

import { AppConfig, ConfigProviderModuleOptions, ConfigProviderService } from './common/configProvider';

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
        const { general, persistance } = config;
        for (const moduleName in persistance) {
          await ConfigProviderService.generateOrmconfig(config, {
            ...(moduleOptionsPerName[moduleName] || {
              entitiesPathInModule: path.join(general.projectRootPath, `persistance/${moduleName}/entities`),
              migrationsPathInModule: path.join(general.projectRootPath, `persistance/${moduleName}/migrations`),
              modulePathInProject: path.join(general.projectRootPath, `persistance/${moduleName}`)
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
      console.log('=> 0');
      const app = await NestFactory.create(appModules[i], { bodyParser: false });
      console.log('=> 1');
      const apiModuleName = apiModulesOptionsMap.get(i);
      console.log('=>', apiModuleName);
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
