import { DynamicModule, Module } from '@nestjs/common';

import { RDBModule } from '@node-c/persistance-rdb';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class PersistanceDBConfigsModule extends RDBModule {
  static register(): DynamicModule {
    return super.register({
      connectionName: Constants.PERSISTANCE_DB_CONFIGS_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: PersistanceDBConfigsModule,
      moduleName: Constants.PERSISTANCE_DB_CONFIGS_MODULE_NAME
    });
  }
}
