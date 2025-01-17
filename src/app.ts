import * as path from 'path';

import { INestApplication, NestModule, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';

import { AppConfig, ConfigProviderModuleOptions, ConfigProviderService } from './common/configProvider';

export interface NodeCAppStartOptions {
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
    const { generateOrmConfig, generateOrmConfigModuleOptions, loadConfigOptions } = options || {};
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    );
    if (!config) {
      config = app.get(ConfigProviderService).config;
    }
    const { api: apiConfigs } = config;
    // configure logging
    app.use(morgan('tiny'));
    // start the API servers
    if (apiConfigs) {
      for (const moduleName in apiConfigs) {
        const { hostname, port } = apiConfigs[moduleName];
        if (!hostname || !port) {
          continue;
        }
        await app.listen(port as number, hostname as string);
        console.info(`[API.${moduleName}] Server listening at ${hostname}:${port}.`);
      }
    }
    return app;
  }
}
