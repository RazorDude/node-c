import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class DataCacheFederatedModule extends RedisModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DataCacheFederatedModule,
      moduleName: Constants.DATA_CACHE_FEDERATED_MODULE_NAME
    });
  }
}
