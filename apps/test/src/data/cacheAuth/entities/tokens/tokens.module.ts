import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataCacheAuthTokenSchema } from './tokens.entity.js';
import { DataCacheAuthTokensEntityService } from './tokens.service.js';

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
