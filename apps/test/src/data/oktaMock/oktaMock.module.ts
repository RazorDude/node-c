import { type DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/data-typeorm';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './entities/oktaMock.entities.js';

@Module({})
export class DataOktaMockModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return TypeORMDBModule.register({
      connectionName: Constants.DATA_OKTA_MOCK_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: DataOktaMockModule,
      moduleName: Constants.DATA_OKTA_MOCK_MODULE_NAME
    });
  }
}
