import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/persistance-redis';

import { AuthorizationPoint, AuthorizationPointSchema } from './authorizationPoints.entity';
import { AuthorizationPointsEntityService } from './authorizationPoints.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register<AuthorizationPoint>({
      persistanceModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      schema: AuthorizationPointSchema
    })
  ],
  providers: [AuthorizationPointsEntityService],
  exports: [AuthorizationPointsEntityService]
})
export class AuthorizationPointsEntityModule {}
