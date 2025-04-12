import { DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/persistance-typeorm';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class PersistanceDBModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return super.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: PersistanceDBModule,
      moduleName: Constants.PERSISTANCE_DB_MODULE_NAME
    });
  }
}
