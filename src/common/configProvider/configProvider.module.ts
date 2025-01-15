import { DynamicModule, Global, Module } from '@nestjs/common';

import { ConfigProviderModuleOptions } from './configProvider.definitions';
import { ConfigProviderService } from './configProvider.service';

import { Constants } from '../definitions';

@Global()
@Module({})
export class ConfigProviderModule {
  static register(options: ConfigProviderModuleOptions): DynamicModule {
    const { appConfigs, envKeys, envKeysParentNames } = options;
    return {
      module: ConfigProviderModule,
      providers: [
        {
          provide: Constants.CONFIG,
          useFactory: async () => await ConfigProviderService.loadConfig(appConfigs, { envKeys, envKeysParentNames })
        },
        ConfigProviderService
      ],
      exports: [Constants.CONFIG, ConfigProviderService]
    };
  }
}