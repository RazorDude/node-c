import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { CacheUserSchema } from './users.entity';
import { CacheUsersEntityService } from './users.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      schema: CacheUserSchema
    })
  ],
  providers: [CacheUsersEntityService],
  exports: [CacheUsersEntityService]
})
export class CacheUsersEntityModule {}
