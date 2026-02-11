import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/data-redis';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class DataCacheAuthModule extends RedisModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DataCacheAuthModule,
      moduleName: Constants.PERSISTANCE_CACHE_AUTH_MODULE_NAME
    });
  }
}
