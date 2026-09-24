import { DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/data-typeorm';

import * as FolderData from './entities/db.entities.js';

import { Constants } from '../../common/definitions/common.constants.js';

@Module({})
export class DataDBModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return super.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: DataDBModule,
      moduleName: Constants.DATA_DB_MODULE_NAME
    });
  }
}
