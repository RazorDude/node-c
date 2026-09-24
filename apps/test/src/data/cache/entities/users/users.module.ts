import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheUserSchema } from './users.entity.js';
import { DataCacheUsersEntityService } from './users.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_MODULE_NAME,
      schema: DataCacheUserSchema
    })
  ],
  providers: [DataCacheUsersEntityService],
  exports: [DataCacheUsersEntityService]
})
export class DataCacheUsersEntityModule {}
