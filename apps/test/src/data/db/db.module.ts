import { type DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/data-typeorm';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './entities/db.entities.js';

@Module({})
export class DataDBModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return TypeORMDBModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: DataDBModule,
      moduleName: Constants.DATA_DB_MODULE_NAME
    });
  }
}
