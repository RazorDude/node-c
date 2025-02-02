import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@node-c/persistance-redis';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class PersistanceCacheModule extends RedisModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: PersistanceCacheModule,
      moduleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      storeKey: Constants.PERSISTANCE_CACHE_MODULE_STORE_KEY
    });
  }
}
