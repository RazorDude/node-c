import path from 'path';

import {
  AppConfigDataRDB,
  AppEnvironment,
  ConfigProviderModuleOptions,
  ConfigProviderService,
  RDBType
} from '../common/configProvider';

(async () => {
  const logPrefix = '[Node-C][generateDatasourceFiles]';
  console.info(`${logPrefix}: Loading configurations...`);
  const appModule = await import(path.resolve(process.cwd(), './dist/app.module'));
  const { appConfigs, envKeys, envKeysParentNames, useEnvFile, useEnvFileWithPriority } = appModule.AppModuleBase
    .configProviderModuleRegisterOptions as ConfigProviderModuleOptions;
  const envName = process.env['DATASOURCE_ENV'] as AppEnvironment;
  const envProfileConfigName = `appConfigProfile${envName.charAt(0).toUpperCase()}${envName.substring(1, envName.length)}`;
  const config = await ConfigProviderService.loadConfig(
    {
      appConfigCommon: appConfigs['appConfigCommon'],
      [envProfileConfigName]: appConfigs[envProfileConfigName as keyof typeof appConfigs]
    } as ConfigProviderModuleOptions['appConfigs'],
    { envKeys, envKeysParentNames, envName, useEnvFile, useEnvFileWithPriority }
  );
  const { data } = config;
  const moduleNames = process.env['MODULE_NAMES']?.split(',') || [];
  console.info(`${logPrefix}: Configurations loaded. Generating files for ${moduleNames.length} modules...`);
  for (const i in moduleNames) {
    const moduleName = moduleNames[i];
    const innerLogPrefix = `${logPrefix}[${moduleName}]`;
    console.info(`${innerLogPrefix}: Generating files for the module...`);
    const moduleConfig = data[moduleName] as AppConfigDataRDB;
    if (!moduleConfig) {
      console.info(`${innerLogPrefix}: No module config found.`);
      continue;
    }
    const { type: moduleType } = moduleConfig;
    if (moduleType === RDBType.ClickHouse || !Object.values(RDBType).includes(moduleType as RDBType)) {
      console.info(`${innerLogPrefix}: Module type ${moduleType} is not eligible for file generation.`);
      continue;
    }
    await ConfigProviderService.generateOrmconfig(config, {
      entitiesPathInModule: 'entities',
      migrationsPathInModule: 'migrations',
      moduleName,
      modulePathInProject: `src/data/${moduleName}`,
      seedsPathInModule: 'seeds'
    });
    console.info(`${innerLogPrefix}: Module files generated successfully.`);
  }
  console.info(`${logPrefix}: Files generated successfully.`);
})().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  }
);
