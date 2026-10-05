import { type DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './entities/cacheStandalone.entities.js';

@Module({})
export class DataCacheStandaloneModule extends RedisModule {
  static register(): DynamicModule {
    return RedisModule.register({
      folderData: FolderData,
      moduleClass: DataCacheStandaloneModule,
      moduleName: Constants.DATA_CACHE_STANDALONE_MODULE_NAME
    });
  }
}
