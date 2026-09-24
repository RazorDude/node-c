import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheAuthUserStepDataItemSchema } from './userStepDataItems.entity.js';
import { DataCacheAuthUserStepDataItemsEntityService } from './userStepDataItems.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_AUTH_MODULE_NAME,
      schema: DataCacheAuthUserStepDataItemSchema
    })
  ],
  providers: [DataCacheAuthUserStepDataItemsEntityService],
  exports: [DataCacheAuthUserStepDataItemsEntityService]
})
export class DataCacheAuthUserStepDataItemsEntityModule {}
