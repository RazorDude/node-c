import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/persistance-redis';

import { AccessControlPoint, AccessControlPointSchema } from './accessControlPoints.entity';
import { AccessControlPointsEntityService } from './accessControlPoints.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RedisRepositoryModule.register<AccessControlPoint>({
      persistanceModuleName: Constants.PERSISTANCE_CACHE_MODULE_NAME,
      schema: AccessControlPointSchema,
      storeKey: Constants.PERSISTANCE_CACHE_MODULE_STORE_KEY
    })
  ],
  providers: [AccessControlPointsEntityService],
  exports: [AccessControlPointsEntityService]
})
export class AccessControlPointsEntityModule {}
