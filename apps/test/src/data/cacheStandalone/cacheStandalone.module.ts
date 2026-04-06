import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class DataCacheStandaloneModule extends RedisModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DataCacheStandaloneModule,
      moduleName: Constants.DATA_CACHE_STANDALONE_MODULE_NAME
    });
  }
}
