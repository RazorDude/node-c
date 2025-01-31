import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/persistance/redis/repository';

import { CacheTokenSchema } from './tokens.entity';
import { CacheTokensEntityService } from './tokens.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      persistanceModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      schema: CacheTokenSchema,
      storeKey: Constants.PERSISTANCE_CACHE_MODULE_STORE_KEY
    })
  ],
  providers: [CacheTokensEntityService],
  exports: [CacheTokensEntityService]
})
export class CacheTokensEntityModule {}
