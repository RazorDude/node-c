import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataCacheStandaloneUserStepDataItemSchema } from './userStepDataItems.entity.js';
import { DataCacheStandaloneUserStepDataItemsEntityService } from './userStepDataItems.service.js';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_STANDALONE_MODULE_NAME,
      schema: DataCacheStandaloneUserStepDataItemSchema
    })
  ],
  providers: [DataCacheStandaloneUserStepDataItemsEntityService],
  exports: [DataCacheStandaloneUserStepDataItemsEntityService]
})
export class DataCacheStandaloneUserStepDataItemsEntityModule {}
