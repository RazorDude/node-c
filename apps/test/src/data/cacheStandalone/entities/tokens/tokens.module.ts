import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheStandaloneTokenSchema } from './tokens.entity.js';
import { DataCacheStandaloneTokensEntityService } from './tokens.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_STANDALONE_MODULE_NAME,
      schema: DataCacheStandaloneTokenSchema
    })
  ],
  providers: [DataCacheStandaloneTokensEntityService],
  exports: [DataCacheStandaloneTokensEntityService]
})
export class DataCacheStandaloneTokensEntityModule {}
