import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { CacheAuthTokenSchema } from './tokens.entity';
import { CacheAuthTokensEntityService } from './tokens.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.PERSISTANCE_CACHE_AUTH_MODULE_NAME,
      schema: CacheAuthTokenSchema
    })
  ],
  providers: [CacheAuthTokensEntityService],
  exports: [CacheAuthTokensEntityService]
})
export class CacheAuthTokensEntityModule {}
