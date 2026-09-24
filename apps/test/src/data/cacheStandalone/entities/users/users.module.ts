import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheStandaloneUserSchema } from './users.entity.js';
import { DataCacheStandaloneUsersEntityService } from './users.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

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
