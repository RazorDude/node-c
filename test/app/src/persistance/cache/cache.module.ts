import { RedisModuleOptions } from '@node-c/persistance/redis/module';

import { Constants } from '../../common/definitions';

export const persistanceCacheModuleOptions: RedisModuleOptions = {
  folderData: {},
  moduleName: Constants.CACHE_MODULE_NAME,
  storeKey: Constants.CACHE_MODULE_STORE_KEY
};
