import { type DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './entities/cacheFederated.entities.js';

@Module({})
export class DataCacheFederatedModule extends RedisModule {
  static register(): DynamicModule {
    return RedisModule.register({
      folderData: FolderData,
      moduleClass: DataCacheFederatedModule,
      moduleName: Constants.DATA_CACHE_FEDERATED_MODULE_NAME
    });
  }
}
