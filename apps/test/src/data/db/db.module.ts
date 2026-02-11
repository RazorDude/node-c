import { DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/data-typeorm';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class DataDBModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return super.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: DataDBModule,
      moduleName: Constants.PERSISTANCE_DB_MODULE_NAME
    });
  }
}
