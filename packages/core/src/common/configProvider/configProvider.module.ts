import { DynamicModule, Module } from '@nestjs/common';

import { ConfigProviderModuleOptions } from './configProvider.definitions';
import { ConfigProviderService } from './configProvider.service';

import { Constants } from '../definitions';

@Module({})
export class ConfigProviderModule {
  static register(options: ConfigProviderModuleOptions): DynamicModule {
    const { appConfigs, ...otherOptions } = options;
    return {
      global: true,
      module: ConfigProviderModule,
      providers: [
        {
          provide: Constants.CONFIG,
          useFactory: async () => await ConfigProviderService.loadConfig(appConfigs, { ...otherOptions })
        },
        ConfigProviderService
      ],
      exports: [Constants.CONFIG, ConfigProviderService]
    };
  }
}
