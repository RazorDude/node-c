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
    const { entitiesBasePath, migrationsPath } = options;
    const entitiesDirPath = path.join(process.cwd(), entitiesBasePath);
    const entitiesDirData = await fs.readdir(entitiesDirPath);
    const entities: string[] = [];
    const subscribers: string[] = [];
    for (const i in entitiesDirData) {
      const entityName = entitiesDirData[i];
      if (entityName.match(/(\.)|(base)/)) {
        continue;
      }
      entities.push(`${entitiesBasePath}/${entityName}/${entityName}.entity.ts`);
      try {
        await fs.lstat(path.join(entitiesDirPath, entityName, `${entityName}.subscriber.ts`));
        subscribers.push(`${entitiesBasePath}/${entityName}/${entityName}.subscriber.ts`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
    }
    await fs.writeFile(
      path.join(process.cwd(), 'ormconfig.json'),
      JSON.stringify(
        mergeDeepRight(config.persistance.db, {
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
    const moduleTypesRegex = new RegExp(`^((${Object.keys(envKeys).join(')|(')})_`);
    config.general.environment = envName;
    // populate the data from the .env file into the config object
    dotenv.parse((await fs.readFile(path.join(process.cwd(), `envFiles/${envName}.env`))).toString());
    // first pass - create a list of modules by name and map them by module type
    for (const envKey in processEnv) {
      const [, moduleCategory] = envKey.match(moduleTypesRegex) || [];
      if (!moduleCategory) {
        continue;
      }
      const [, moduleName] = envKey.match(new RegExp(`^${moduleCategory}_(.+)_?MODULE_TYPE$`)) || [];
      if (!moduleName) {
        continue;
      }
      const moduleFields = envKeys[moduleCategory as keyof typeof envKeys];
      const moduleType = processEnv[envKey] as keyof typeof moduleFields;
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
            setNested(config, configKey, processEnv[envKey]);
          }
        });
      }
    }
    return config;
  }
}
