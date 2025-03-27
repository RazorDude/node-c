import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/persistance-redis';

import { AuthorizationPoint, AuthorizationPointSchema } from './authorizationPoints.entity';
import { CacheAuthorizationPointsEntityService } from './authorizationPoints.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register<AuthorizationPoint>({
      persistanceModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      schema: AuthorizationPointSchema
    })
  ],
  providers: [CacheAuthorizationPointsEntityService],
  exports: [CacheAuthorizationPointsEntityService]
})
export class CacheAuthorizationPointsEntityModule {}
