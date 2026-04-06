import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheUserSchema } from './users.entity';
import { DataCacheUsersEntityService } from './users.service';

import { Constants } from '../../../../common/definitions';

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
