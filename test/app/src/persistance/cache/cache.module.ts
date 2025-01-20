import { Global, Module } from '@nestjs/common';

import { RedisModule, RedisModuleOptions } from '@node-c/persistance/redis/module';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Global()
@Module({})
export class PersistanceCacheModule extends RedisModule {
  static readonly moduleOptions: RedisModuleOptions = {
    folderData: FolderData,
    moduleClass: PersistanceCacheModule,
    moduleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
    storeKey: Constants.CACHE_MODULE_STORE_KEY
  };
}
