import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

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
