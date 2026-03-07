import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { CacheAuthUserStepDataItemSchema } from './userStepDataItems.entity';
import { CacheAuthUserStepDataItemsEntityService } from './userStepDataItems.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_AUTH_MODULE_NAME,
      schema: CacheAuthUserStepDataItemSchema
    })
  ],
  providers: [CacheAuthUserStepDataItemsEntityService],
  exports: [CacheAuthUserStepDataItemsEntityService]
})
export class CacheAuthUserStepDataItemsEntityModule {}
