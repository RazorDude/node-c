import { Module } from '@nestjs/common';

import { RedisModule, RedisModuleOptions } from '@node-c/persistance/redis/module';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class PersistanceCacheModule extends RedisModule {
  static moduleOptions: RedisModuleOptions = {
    folderData: FolderData,
    moduleName: Constants.CACHE_MODULE_NAME,
    storeKey: Constants.CACHE_MODULE_STORE_KEY
  };
}
