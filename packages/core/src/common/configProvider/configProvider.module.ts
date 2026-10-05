import { type DynamicModule, Module } from '@nestjs/common';
import { Constants } from '../definitions/common.constants.js';
import type {
  AppConfig,
  ConfigProviderModuleOptions
} from './configProvider.definitions.js';
import { ConfigProviderService } from './configProvider.service.js';

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
          useFactory: async (): Promise<AppConfig> =>
            await ConfigProviderService.loadConfig(appConfigs, {
              ...otherOptions
            })
        },
        ConfigProviderService
      ],
      exports: [Constants.CONFIG, ConfigProviderService]
    };
  }
}
