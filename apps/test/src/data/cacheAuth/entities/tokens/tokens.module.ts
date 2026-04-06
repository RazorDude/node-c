import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheAuthTokenSchema } from './tokens.entity';
import { DataCacheAuthTokensEntityService } from './tokens.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_AUTH_MODULE_NAME,
      schema: DataCacheAuthTokenSchema
    })
  ],
  providers: [DataCacheAuthTokensEntityService],
  exports: [DataCacheAuthTokensEntityService]
})
export class DataCacheAuthTokensEntityModule {}
