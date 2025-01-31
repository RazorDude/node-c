import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/persistance/redis/repository';

import { CacheUserSchema } from './users.entity';
import { CacheUsersEntityService } from './users.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register({
      persistanceModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      schema: CacheUserSchema,
      storeKey: Constants.PERSISTANCE_CACHE_MODULE_STORE_KEY
    })
  ],
  providers: [CacheUsersEntityService],
  exports: [CacheUsersEntityService]
})
export class CacheUsersEntityModule {}
