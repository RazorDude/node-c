import * as fs from 'fs/promises';
import * as path from 'path';

import { Inject, Injectable } from '@nestjs/common';
import { setNested } from '@ramster/general-tools';
import dotenv from 'dotenv';
import { mergeDeepRight } from 'ramda';

import {
  APP_CONFIG_FROM_ENV_KEYS as APP_CONFIG_FROM_ENV_KEYS_DEFAULT,
  APP_CONFIG_FROM_ENV_KEYS_PARENT_NAMES as APP_CONFIG_FROM_ENV_KEYS_PARENT_NAMES_DEFAULT,
  AppConfig as AppConfigDefault,
  AppEnvironment,
  GenerateOrmconfigOptions,
  LoadConfigAppConfigs,
  LoadConfigOptions
} from './configProvider.definitions';

import { Constants } from '../definitions';

@Injectable()
export class ConfigProviderService<AppConfig extends AppConfigDefault = AppConfigDefault> {
  constructor(
    @Inject(Constants.CONFIG)
    // eslint-disable-next-line no-unused-vars
    public config: AppConfig
  ) {}

  static async generateOrmconfig<AppConfig extends AppConfigDefault = AppConfigDefault>(
    config: AppConfig,
    options: GenerateOrmconfigOptions
  ): Promise<void> {
    const {
      general: { projectRootPath },
      persistance
    } = config;
    const { entitiesPathInModule, migrationsPathInModule, moduleName, modulePathInProject } = options;
    const entitiesDirPath = path.join(projectRootPath, modulePathInProject, entitiesPathInModule);
    const entitiesDirData = await fs.readdir(entitiesDirPath);
    const entities: string[] = [];
    const migrationsPath = path.join(projectRootPath, modulePathInProject, migrationsPathInModule);
    const subscribers: string[] = [];
    for (const i in entitiesDirData) {
      const entityName = entitiesDirData[i];
      if (entityName.match(/^base$/)) {
        continue;
      }
      const entityFolderPath = path.join(entitiesDirPath, entityName);
      const entityFolderData = await fs.readdir(entityFolderPath);
      for (const j in entityFolderData) {
        const entityFolderFileName = entityFolderData[j];
        if (entityFolderFileName.match(/\.entity\./)) {
          entities.push(path.join(entityFolderPath, entityFolderFileName));
          continue;
        }
        if (entityFolderFileName.match(/\.subscriber\./)) {
          subscribers.push(path.join(entityFolderPath, entityFolderFileName));
          continue;
        }
      }
    }
    await fs.writeFile(
      path.join(projectRootPath, `ormconfig-${moduleName}.json`),
      JSON.stringify(
        mergeDeepRight(persistance[moduleName], {
          entities: [...entities],
          subscribers: [...subscribers],
          migrations: [`${migrationsPath}/**/*.ts`],
          cli: {
            migrationsDir: migrationsPath
          }
        })
      )
    );
  }

  // TODO: logging about invalid config values
  static async loadConfig<AppConfig extends AppConfigDefault = AppConfigDefault>(
    appConfigs: LoadConfigAppConfigs,
    options?: LoadConfigOptions
  ): Promise<AppConfig> {
    const { ...optionsData } = options || ({} as LoadConfigOptions);
    const envKeys = optionsData.envKeys || APP_CONFIG_FROM_ENV_KEYS_DEFAULT;
    const envKeysParentNames = optionsData.envKeysParentNames || APP_CONFIG_FROM_ENV_KEYS_PARENT_NAMES_DEFAULT;
    const processEnv = process.env;
    const envName = (processEnv['NODE_ENV'] as AppEnvironment) || AppEnvironment.Local;
    const config = mergeDeepRight(
      appConfigs.appConfigCommon,
      appConfigs[
        `appConfigProfile${envName.charAt(0).toUpperCase()}${envName.substring(
          1,
          envName.length
        )}` as keyof typeof appConfigs
      ]
    ) as AppConfig;
    const moduleNamesByCategoryAndType: {
      [moduleCategory: string]: { [moduleType: string]: string[] };
    } = {};
    const moduleTypesRegex = new RegExp(`^((${Object.keys(envKeys).join(')|(')}))_`);
    config.general.environment = envName;
    // populate the data from the .env file into the config object
    const envVars = dotenv.parse(
      (await fs.readFile(path.join(config.general.projectRootPath, `envFiles/.${envName}.env`))).toString()
    );
    // first pass - create a list of modules by name and map them by module type
    for (const envKey in envVars) {
      const [, moduleCategory] = envKey.match(moduleTypesRegex) || [];
      if (!moduleCategory) {
        continue;
      }
      const [, moduleName] = envKey.match(new RegExp(`^${moduleCategory}_(.+)_MODULE_TYPE$`)) || [];
      if (!moduleName) {
        continue;
      }
      const moduleFields = envKeys[moduleCategory as keyof typeof envKeys];
      const moduleType = envVars[envKey] as keyof typeof moduleFields;
      if (!moduleFields[moduleType]) {
        continue;
      }
      if (!moduleNamesByCategoryAndType[moduleCategory]) {
        moduleNamesByCategoryAndType[moduleCategory] = {};
      }
      if (!moduleNamesByCategoryAndType[moduleCategory][moduleType]) {
        moduleNamesByCategoryAndType[moduleCategory][moduleType] = [];
      }
      moduleNamesByCategoryAndType[moduleCategory][moduleType].push(moduleName);
    }
    // second pass - actually go through the env vars and populate them in the config accordingly
    for (const moduleCategory in moduleNamesByCategoryAndType) {
      const { children: moduleConfigKeysForCategory, name: categoryConfigKey } = envKeysParentNames[moduleCategory];
      const moduleFieldsForCategory = envKeys[moduleCategory as keyof typeof envKeys];
      const moduleNamesByType = moduleNamesByCategoryAndType[moduleCategory];
      for (const moduleType in moduleNamesByType) {
        const moduleFieldsForType = moduleFieldsForCategory[
          moduleType as keyof typeof moduleFieldsForCategory
        ] as Record<string, string>;
        const moduleNames = moduleNamesByType[moduleType];
        moduleNames.forEach(moduleName => {
          const moduleConfigKey = moduleConfigKeysForCategory[moduleName];
          for (const fieldName in moduleFieldsForType) {
            const configKey = `${categoryConfigKey}.${moduleConfigKey}.${moduleFieldsForType[fieldName]}`;
            const envKey = `${moduleCategory}_${moduleName}_${fieldName}`;
            setNested(config, configKey, envVars[envKey]);
          }
        });
      }
    }
    return config;
  }
}
