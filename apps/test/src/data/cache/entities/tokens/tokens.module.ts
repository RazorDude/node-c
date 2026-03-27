import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { CacheTokenSchema } from './tokens.entity';
import { CacheTokensEntityService } from './tokens.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_AUTH_MODULE_NAME,
      schema: CacheTokenSchema
    })
  ],
  providers: [CacheTokensEntityService],
  exports: [CacheTokensEntityService]
})
export class CacheTokensEntityModule {}
