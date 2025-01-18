import * as path from 'path';

import { INestApplication, NestModule, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';

import { AppConfig, ConfigProviderModuleOptions, ConfigProviderService } from './common/configProvider';

export interface NodeCAppStartOptions {
  apiModuleName?: string;
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
  static async start(module: NestModule, options?: NodeCAppStartOptions): Promise<INestApplication<unknown>> {
    const { apiModuleName, generateOrmConfig, generateOrmConfigModuleOptions, loadConfigOptions } = options || {};
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
    // create the nest app from the main module
    const app = await NestFactory.create(module, { bodyParser: false });
    if (!config) {
      config = app.get(ConfigProviderService).config;
    }
    const { api: apiConfigs } = config;
    // start an API server, if requested in the options
    if (apiConfigs && apiModuleName) {
      const apiConfig = apiConfigs[apiModuleName];
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
    }
    return app;
  }
}
