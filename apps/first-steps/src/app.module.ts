import { Module } from '@nestjs/common';

import {
  ConfigProviderModule,
  type ConfigProviderModuleOptions,
  LoggerModule
} from '@node-c/core';

import { APITasksModule } from './api/tasks/tasks.module.js';
import * as AppConfigs from './config/config.js';
import { DataDBModule } from './data/db/db.module.js';
import { DomainTasksModule } from './domain/tasks/tasks.module.js';

// the generateDatasourceFiles script reads the config options from AppModuleBase in dist/app.module.js
export class AppModuleBase {
  static readonly configProviderModuleRegisterOptions: ConfigProviderModuleOptions =
    {
      appConfigs:
        AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs']
    };
}

@Module({
  imports: [
    ConfigProviderModule.register(
      AppModuleBase.configProviderModuleRegisterOptions
    ),
    LoggerModule.register(),
    DataDBModule.register(),
    DomainTasksModule,
    APITasksModule.register(APITasksModule.moduleOptions)
  ]
})
export class AppModule extends AppModuleBase {}
