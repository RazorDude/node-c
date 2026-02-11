import { Provider } from '@nestjs/common';
import { ConfigProviderService } from '@node-c/core';
import { RedisClientType } from 'redis';
import { describe, expect, it, vi } from 'vitest';

import { RedisStoreModule, RedisStoreService } from './index';

import { Constants } from '../common/definitions';

describe('RedisStoreModule', () => {
  describe('register', () => {
    const dummyOptions = {
      dataModuleName: 'testData'
    };
    const serviceToken = `${dummyOptions.dataModuleName}${Constants.REDIS_CLIENT_STORE_SERVICE_SUFFIX}`;
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
          { provide: Constants.REDIS_CLIENT_PERSISTANCE_MODULE_NAME, useValue: dummyOptions.dataModuleName },
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
          data: {
            [dummyOptions.dataModuleName]: {
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
        dataModuleName: dummyOptions.dataModuleName
      });
      expect(result).toBe(dummyClient);
      createClientSpy.mockRestore();
    });
  });
});
