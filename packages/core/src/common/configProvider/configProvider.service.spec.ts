import * as fs from 'fs/promises';
import * as path from 'path';

import im from 'immutable';
import { mergeDeepRight } from 'ramda';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  AppConfig,
  AppConfigCommon,
  AppEnvironment,
  GenerateOrmconfigOptions,
  LoadConfigAppConfigs
} from './configProvider.definitions';
import { ConfigProviderService } from './configProvider.service';

const BASE_PATH = path.join(__dirname, '../../../test');

describe('ConfigProviderService', () => {
  describe('constructor', () => {
    it('should assign the passed config to the service', () => {
      const fakeConfig: AppConfig = {
        api: {},
        domain: {},
        general: {
          environment: AppEnvironment.Local,
          projectName: 'TestProject',
          projectRootPath: '/some/path',
          projectVersion: '1.0.0'
        },
        persistance: {}
      };
      const service = new ConfigProviderService(fakeConfig);
      expect(service.config).toEqual(fakeConfig);
    });
  });

  // generateOrmconfig
  describe('generateOrmconfig', () => {
    const defaultFakeModuleName = 'db';
    const defaultFakeOptions: GenerateOrmconfigOptions = {
      entitiesPathInModule: 'entities',
      migrationsPathInModule: 'migrations',
      moduleName: defaultFakeModuleName,
      modulePathInProject: 'src/persistance/db'
    };
    const defaultFakeConfig: AppConfig = {
      api: {},
      domain: {},
      general: {
        environment: AppEnvironment.Local,
        projectName: 'TestProject',
        projectRootPath: BASE_PATH,
        projectVersion: '1.0.0'
      },
      persistance: {
        [defaultFakeModuleName]: { type: 'mysql', extra: 'foo' }
      }
    };
    let fakeModuleName: string;
    let fakeOptions: GenerateOrmconfigOptions;
    let fakeConfig: AppConfig;
    let entitiesDirPath: string;
    let migrationsPath: string;
    let ormConfigPath: string;
    // clean up before each test
    beforeEach(async () => {
      fakeModuleName = defaultFakeModuleName;
      fakeOptions = im.fromJS(defaultFakeOptions).toJS() as unknown as GenerateOrmconfigOptions;
      fakeConfig = im.fromJS(defaultFakeConfig).toJS() as unknown as AppConfig;
      entitiesDirPath = path.join(BASE_PATH, fakeOptions.modulePathInProject, fakeOptions.entitiesPathInModule);
      migrationsPath = path.join(BASE_PATH, fakeOptions.modulePathInProject, fakeOptions.migrationsPathInModule);
      ormConfigPath = path.join(BASE_PATH, `ormconfig-${fakeModuleName}.json`);
      try {
        await fs.unlink(ormConfigPath);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e: unknown) {}
    });
    it('should generate ormconfig file with entities and subscribers arrays correctly', async () => {
      await ConfigProviderService.generateOrmconfig(fakeConfig, fakeOptions);
      const expectedEntities = [
        path.join(entitiesDirPath, 'orders', 'orders.entity.ts'),
        path.join(entitiesDirPath, 'users', 'users.entity.ts')
      ];
      const expectedSubscribers = [
        path.join(entitiesDirPath, 'orders', 'orders.subscriber.ts'),
        path.join(entitiesDirPath, 'users', 'users.subscriber.ts')
      ];
      const expectedMergedConfig = mergeDeepRight(fakeConfig.persistance[fakeModuleName], {
        entities: expectedEntities,
        subscribers: expectedSubscribers,
        migrations: [`${migrationsPath}/**/*.ts`],
        cli: { migrationsDir: migrationsPath }
      });
      expect((await fs.readFile(ormConfigPath)).toString()).toEqual(JSON.stringify(expectedMergedConfig));
    });
    it('should handle case with empty entities directory (no folders)', async () => {
      fakeOptions.entitiesPathInModule = 'entitiesEmpty';
      await ConfigProviderService.generateOrmconfig(fakeConfig, fakeOptions);
      const expectedMergedConfig = mergeDeepRight(fakeConfig.persistance[fakeModuleName], {
        entities: [],
        subscribers: [],
        migrations: [`${migrationsPath}/**/*.ts`],
        cli: { migrationsDir: migrationsPath }
      });
      expect((await fs.readFile(ormConfigPath)).toString()).toEqual(JSON.stringify(expectedMergedConfig));
    });
    it('should ignore files that do not match entity or subscriber patterns', async () => {
      await ConfigProviderService.generateOrmconfig(fakeConfig, fakeOptions);
      const writtenConfig = JSON.parse((await fs.readFile(ormConfigPath)).toString());
      expect(writtenConfig.entities).toEqual(
        expect.arrayContaining([
          path.join(entitiesDirPath, 'users', 'users.entity.ts'),
          path.join(entitiesDirPath, 'orders', 'orders.entity.ts')
        ])
      );
      expect(writtenConfig.entities).not.toEqual(
        expect.arrayContaining([
          path.join(entitiesDirPath, 'misc', 'note.txt'),
          path.join(entitiesDirPath, 'misc', 'helper.ts')
        ])
      );
    });
    it('should propagate error if fs.readdir fails', async () => {
      fakeOptions.entitiesPathInModule = 'entitiesNotExistent';
      await expect(ConfigProviderService.generateOrmconfig(fakeConfig, fakeOptions)).rejects.toThrow('ENOENT');
    });
  });

  // loadConfig
  describe('loadConfig', () => {
    const defaultAppConfigs: LoadConfigAppConfigs = {
      appConfigCommon: {
        general: {
          projectName: 'TestProject',
          projectRootPath: BASE_PATH,
          projectVersion: '1.0.0'
        },
        api: {
          test: {}
        },
        domain: {},
        persistance: {}
      },
      appConfigProfileLocal: {
        general: { environment: AppEnvironment.Local }
      }
    };
    const defaultEnvKeys = {
      API: {
        HTTP: { HOST: 'hostname', PORT: 'port' }
      }
    };
    const defaultEnvKeysParentNames = {
      API: {
        children: { TEST: 'test' },
        name: 'api'
      }
    };
    let appConfigs: LoadConfigAppConfigs;

    beforeEach(() => {
      process.env.NODE_ENV = 'local';
      appConfigs = im.fromJS(defaultAppConfigs).toJS() as unknown as LoadConfigAppConfigs;
    });
    it('should load and merge configuration from env file and populate nested values', async () => {
      delete process.env['NODE_ENV'];
      const loadedConfig = await ConfigProviderService.loadConfig(appConfigs, {
        envKeys: defaultEnvKeys,
        envKeysParentNames: defaultEnvKeysParentNames
      });
      expect(loadedConfig.general.environment).toBe('local');
      expect(loadedConfig.api).toBeDefined();
      expect(loadedConfig.api.rest).toBeUndefined();
      expect(loadedConfig.api.test).toBeDefined();
      expect(loadedConfig.api.test.hostname).toBe('127.0.0.1');
      expect(loadedConfig.api.test.port).toBe('3000');
    });
    it('should use default envKeys and envKeysParentNames if options not provided', async () => {
      appConfigs.appConfigCommon.api!.rest = {};
      const loadedConfig = await ConfigProviderService.loadConfig(appConfigs);
      expect(loadedConfig.general.environment).toBe('local');
      expect(loadedConfig.api.rest).toBeDefined();
      expect(loadedConfig.api.rest.hostname).toBe('localhost');
      expect(loadedConfig.api.test.hostname).toBeUndefined();
    });
    it('should throw an error if the .env file is missing', async () => {
      (appConfigs.appConfigCommon as AppConfigCommon).general.projectRootPath = '/fake/path';
      await expect(
        ConfigProviderService.loadConfig(appConfigs, {
          envKeys: defaultEnvKeys,
          envKeysParentNames: defaultEnvKeysParentNames
        })
      ).rejects.toThrow('ENOENT');
    });
    it('should skip env keys that do not match expected pattern', async () => {
      const loadedConfig = await ConfigProviderService.loadConfig(appConfigs, {
        envKeys: defaultEnvKeys,
        envKeysParentNames: defaultEnvKeysParentNames
      });
      expect(loadedConfig.api.test.hostname).toBe('127.0.0.1');
      expect(loadedConfig.api.test.port).toBe('3000');
      expect(loadedConfig.api.something).toBeUndefined();
    });
  });
});
