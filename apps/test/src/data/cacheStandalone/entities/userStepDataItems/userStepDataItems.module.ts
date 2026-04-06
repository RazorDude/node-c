import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheStandaloneUserStepDataItemSchema } from './userStepDataItems.entity';
import { DataCacheStandaloneUserStepDataItemsEntityService } from './userStepDataItems.service';

import { Constants } from '../../../../common/definitions';

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
