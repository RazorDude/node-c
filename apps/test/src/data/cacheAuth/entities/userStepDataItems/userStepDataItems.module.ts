import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheAuthUserStepDataItemSchema } from './userStepDataItems.entity';
import { DataCacheAuthUserStepDataItemsEntityService } from './userStepDataItems.service';

import { Constants } from '../../../../common/definitions';

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
