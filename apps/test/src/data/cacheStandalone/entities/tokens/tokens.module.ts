import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheStandaloneTokenSchema } from './tokens.entity';
import { DataCacheStandaloneTokensEntityService } from './tokens.service';

import { Constants } from '../../../../common/definitions';

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
