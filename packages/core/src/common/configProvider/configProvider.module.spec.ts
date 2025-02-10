import { describe, expect, it, vi } from 'vitest';

import { AppConfig, AppEnvironment, ConfigProviderModuleOptions } from './configProvider.definitions';
import { ConfigProviderModule } from './configProvider.module';
import { ConfigProviderService } from './configProvider.service';

import { Constants } from '../definitions';

// Helper type predicate: checks if a provider is a factory provider for a given token.
function isFactoryProvider<T, U>(
  provider: unknown,
  token: T
): provider is { provide: T; useFactory: () => Promise<U> } {
  if (typeof provider !== 'object' || provider === null) {
    return false;
  }
  const p = provider as { provide?: T; useFactory?: unknown };
  return p.provide === token && typeof p.useFactory === 'function';
}

describe('ConfigProviderModule', () => {
  // Create a fake AppConfig with full type information.
  const fakeAppConfig: AppConfig = {
    api: {},
    domain: {},
    general: {
      environment: AppEnvironment.Local,
      projectName: 'TestProject',
      projectRootPath: '/fake/path',
      projectVersion: '1.0.0'
    },
    persistance: {}
  };
  const fakeEnvKeys = {
    API: {
      HTTP: { HOST: 'hostname', PORT: 'port' }
    }
  };
  const fakeEnvKeysParentNames = {
    API: {
      children: { TEST: 'test' },
      name: 'api'
    }
  };
  const fakeModuleOptions: ConfigProviderModuleOptions = {
    appConfigs: { appConfigCommon: fakeAppConfig },
    envKeys: fakeEnvKeys,
    envKeysParentNames: fakeEnvKeysParentNames
  };

  describe('register()', () => {
    it('should return a dynamic module with proper configuration', async () => {
      // Spy on loadConfig so that the factory returns our fake config.
      const loadConfigSpy = vi.spyOn(ConfigProviderService, 'loadConfig').mockResolvedValue(fakeAppConfig);
      const dynamicModule = ConfigProviderModule.register(fakeModuleOptions);
      // Verify dynamic module properties.
      expect(dynamicModule.global).toBe(true);
      expect(dynamicModule.module).toBe(ConfigProviderModule);
      expect(dynamicModule.providers).toEqual(
        expect.arrayContaining([expect.objectContaining({ provide: Constants.CONFIG }), ConfigProviderService])
      );
      expect(dynamicModule.exports).toEqual([Constants.CONFIG, ConfigProviderService]);
      // Locate the provider with the injection token.
      const configProvider = dynamicModule.providers?.find(p =>
        isFactoryProvider<Constants, AppConfig>(p, Constants.CONFIG)
      ) as unknown as { useFactory: () => Promise<ConfigProviderService> };
      expect(configProvider).toBeDefined();
      // Call the useFactory and verify it returns the fake config.
      const producedConfig = await configProvider.useFactory();
      expect(producedConfig).toEqual(fakeAppConfig);
      expect(loadConfigSpy).toHaveBeenCalledWith(
        { appConfigCommon: fakeAppConfig },
        {
          envKeys: fakeEnvKeys,
          envKeysParentNames: fakeEnvKeysParentNames
        }
      );
    });
    it('should propagate errors from the loadConfig factory', async () => {
      const error = new Error('Load config failed');
      vi.spyOn(ConfigProviderService, 'loadConfig').mockRejectedValue(error);
      const dynamicModule = ConfigProviderModule.register(fakeModuleOptions);
      const configProvider = dynamicModule.providers?.find(p =>
        isFactoryProvider<Constants, AppConfig>(p, Constants.CONFIG)
      ) as unknown as { useFactory: () => Promise<ConfigProviderService> };
      expect(configProvider).toBeDefined();
      await expect(configProvider.useFactory()).rejects.toThrow('Load config failed');
    });
  });
});
