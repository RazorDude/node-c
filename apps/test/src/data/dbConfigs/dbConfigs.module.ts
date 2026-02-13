import { DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/data-typeorm';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class DataDBConfigsModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return super.register({
      connectionName: Constants.DATA_DB_CONFIGS_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: DataDBConfigsModule,
      moduleName: Constants.DATA_DB_CONFIGS_MODULE_NAME
    });
  }
}
