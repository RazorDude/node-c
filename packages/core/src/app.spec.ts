import * as path from 'path';

import { INestApplication, Module, NestModule } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  APP_CONFIG_FROM_ENV_KEYS,
  AppEnvironment,
  ConfigProviderModule,
  ConfigProviderService,
  NodeCApp,
  NodeCAppStartOptions
} from './index';

const BASE_PATH = path.join(__dirname, '../test');

const appModuleOptions = {
  appConfigs: {
    appConfigCommon: {
      general: {
        projectName: 'TestProject',
        projectRootPath: BASE_PATH,
        projectVersion: '1.0.0'
      },
      api: { test: {} },
      domain: {},
      persistance: { db: { type: 'mysql', extra: 'foo' } }
    },
    appConfigProfileLocal: {
      general: { environment: AppEnvironment.Local }
    }
  },
  envKeys: APP_CONFIG_FROM_ENV_KEYS,
  envKeysParentNames: {
    API: {
      children: { TEST: 'test' },
      name: 'api'
    }
  }
};

@Module({})
class TestAPIModule {}

@Module({
  imports: [ConfigProviderModule.register(appModuleOptions)]
})
class AppModule {}

@Module({
  imports: [ConfigProviderModule.register(appModuleOptions), TestAPIModule]
})
class AppModuleWithAPI {}

@Module({
  imports: [
    ConfigProviderModule.register({
      ...appModuleOptions,
      envKeys: { API: { HTTP: { HOST: 'hostname', PORT: 'port' } } },
      envKeysParentNames: { API: { children: { TEST: 'test' }, name: 'api' } }
    }),
    TestAPIModule
  ]
})
class AppModuleWithAPIStartable {}

describe('NodeCApp.start', () => {
  let apps: INestApplication<unknown>[];
  process.env.NODE_ENV = 'local';
  afterEach(() => {
    apps?.forEach(app => app.close());
  });
  it('should start apps without options (no loadConfigOptions, no apiModulesOptions)', async () => {
    const apps = await NodeCApp.start([AppModule] as unknown as NestModule[]);
    expect(apps).toHaveLength(1);
  });
  it('should call loadConfig and generateOrmconfig when loadConfigOptions and generateOrmConfig are provided', async () => {
    const generateOrmconfigSpy = vi.spyOn(ConfigProviderService, 'generateOrmconfig');
    const loadConfigSpy = vi.spyOn(ConfigProviderService, 'loadConfig');
    const options: NodeCAppStartOptions = {
      generateOrmConfig: true,
      generateOrmConfigModuleOptions: {
        db: {
          entitiesPathInModule: 'entities',
          migrationsPathInModule: 'migrations',
          modulePathInProject: 'persistance/db'
        }
      },
      loadConfigOptions: appModuleOptions
    };
    apps = await NodeCApp.start([AppModule] as unknown as NestModule[], options);
    // The loadConfig method should be called once with the provided options.
    expect(loadConfigSpy).toHaveBeenCalledTimes(2);
    // For each key in persistance (here just 1 - "db"), generateOrmconfig should be called.
    expect(generateOrmconfigSpy).toHaveBeenCalledTimes(1);
    expect(apps).toHaveLength(1);
  });
  it('should call loadConfig and generateOrmconfig when loadConfigOptions and generateOrmConfig are provided, but generateOrmConfigModuleOptions are not provided', async () => {
    const generateOrmconfigSpy = vi.spyOn(ConfigProviderService, 'generateOrmconfig');
    const loadConfigSpy = vi.spyOn(ConfigProviderService, 'loadConfig');
    const options: NodeCAppStartOptions = {
      generateOrmConfig: true,
      loadConfigOptions: appModuleOptions
    };
    generateOrmconfigSpy.mockClear();
    loadConfigSpy.mockClear();
    apps = await NodeCApp.start([AppModule] as unknown as NestModule[], options);
    // The loadConfig method should be called once with the provided options.
    expect(loadConfigSpy).toHaveBeenCalledTimes(2);
    // For each key in persistance (here just 1 - "db"), generateOrmconfig should be called.
    expect(generateOrmconfigSpy).toHaveBeenCalledTimes(1);
    expect(apps).toHaveLength(1);
  });
  it('should configure API server for a module with matching apiModulesOptions', async () => {
    // Provide an apiModulesOptions mapping module index "1" to "test".
    const options: NodeCAppStartOptions = {
      apiModulesOptions: [{ appModuleIndex: 1, apiModuleName: 'test' }],
      loadConfigOptions: {
        appConfigs: appModuleOptions.appConfigs,
        envKeys: { API: { TEST: { HOST: 'hostname', PORT: 'port' } } },
        envKeysParentNames: { API: { children: { TEST: 'test' }, name: 'api' } }
      }
    };
    // Call start with two modules.
    apps = await NodeCApp.start([AppModule, AppModuleWithAPIStartable] as unknown as NestModule[], options);
    expect(apps).toHaveLength(2);
    const response = await fetch('http://localhost:3000');
    expect(response.status).toEqual(404);
  });
  it('should not call app.listen if the API config lacks hostname or port', async () => {
    const options: NodeCAppStartOptions = {
      apiModulesOptions: [{ appModuleIndex: 0, apiModuleName: 'users' }]
    };
    apps = await NodeCApp.start([AppModule, AppModuleWithAPI] as unknown as NestModule[], options);
    expect(apps).toHaveLength(2);
    await expect(fetch('http://localhost:3000')).rejects.toThrow('fetch failed');
  });
});
