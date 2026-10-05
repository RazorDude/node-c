import { type DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './entities/cacheAuth.entities.js';

@Module({})
export class DataCacheAuthModule extends RedisModule {
  static register(): DynamicModule {
    return RedisModule.register({
      folderData: FolderData,
      moduleClass: DataCacheAuthModule,
      moduleName: Constants.DATA_CACHE_AUTH_MODULE_NAME
    });
  }
}
