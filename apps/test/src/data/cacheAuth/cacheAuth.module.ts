import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities/cacheAuth.entities.js';

import { Constants } from '../../common/definitions/common.constants.js';

@Module({})
export class DataCacheAuthModule extends RedisModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DataCacheAuthModule,
      moduleName: Constants.DATA_CACHE_AUTH_MODULE_NAME
    });
  }
}
