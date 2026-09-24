import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities/cacheFederated.entities.js';

import { Constants } from '../../common/definitions/common.constants.js';

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
