import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheStandaloneUserSchema } from './users.entity';
import { DataCacheStandaloneUsersEntityService } from './users.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_STANDALONE_MODULE_NAME,
      schema: DataCacheStandaloneUserSchema
    })
  ],
  providers: [DataCacheStandaloneUsersEntityService],
  exports: [DataCacheStandaloneUsersEntityService]
})
export class DataCacheStandaloneUsersEntityModule {}
