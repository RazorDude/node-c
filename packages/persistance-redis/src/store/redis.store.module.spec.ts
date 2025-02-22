import { Provider } from '@nestjs/common';
import { ConfigProviderService } from '@node-c/core';
import { RedisClientType } from 'redis';
import { describe, expect, it, vi } from 'vitest';

import { RedisStoreModule, RedisStoreService } from './index';

import { Constants } from '../common/definitions';

describe('RedisStoreModule', () => {
  describe('register', () => {
    const dummyOptions = {
      persistanceModuleName: 'testPersistance',
      storeKey: 'myStoreKey'
    };
    const serviceToken = `${dummyOptions.storeKey}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`;
    it('should return a dynamic module with the expected configuration', () => {
      const dynamicModule = RedisStoreModule.register(dummyOptions);
      expect(dynamicModule).toEqual({
        global: true,
        module: RedisStoreModule,
        providers: [
          {
            provide: Constants.REDIS_CLIENT,
            useFactory: expect.any(Function),
            inject: [ConfigProviderService]
          },
          { provide: Constants.REDIS_CLIENT_STORE_KEY, useValue: dummyOptions.storeKey },
          RedisStoreService,
          { provide: serviceToken, useClass: RedisStoreService }
        ],
        exports: [{ provide: serviceToken, useClass: RedisStoreService }]
      });
    });
    it('should have a useFactory that calls RedisStoreService.createClient with correct parameters', async () => {
      const dynamicModule = RedisStoreModule.register(dummyOptions);
      // Locate the provider for Constants.REDIS_CLIENT.
      const clientProvider = dynamicModule.providers!.find(
        ((provider: { provide: unknown }) => provider.provide === Constants.REDIS_CLIENT) as unknown as (
          _value: Provider<unknown>,
          _index: number,
          _obj: Provider<unknown>[]
        ) => unknown
      ) as unknown as { useFactory: (_arg: unknown) => unknown };
      expect(clientProvider).toBeDefined();
      // Create a fake config provider with a minimal config.
      const fakeConfigProvider: ConfigProviderService = {
        config: {
          persistance: {
            [dummyOptions.persistanceModuleName]: {
              password: 'secret',
              host: 'localhost',
              port: 1234
            }
          }
        }
      } as ConfigProviderService;
      // Spy on RedisStoreService.createClient.
      const dummyClient = {} as ReturnType<typeof RedisStoreService.createClient>;
      const createClientSpy = vi
        .spyOn(RedisStoreService, 'createClient')
        .mockResolvedValue(dummyClient as unknown as RedisClientType);
      // Call the useFactory function and check the results.
      const result = await clientProvider.useFactory(fakeConfigProvider);
      expect(createClientSpy).toHaveBeenCalledWith(fakeConfigProvider.config, {
        persistanceModuleName: dummyOptions.persistanceModuleName
      });
      expect(result).toBe(dummyClient);
      createClientSpy.mockRestore();
    });
  });
});
