import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities/cache.entities.js';

import { Constants } from '../../common/definitions/common.constants.js';

@Module({})
export class DataCacheModule extends RedisModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DataCacheModule,
      moduleName: Constants.DATA_CACHE_MODULE_NAME
    });
  }
}
