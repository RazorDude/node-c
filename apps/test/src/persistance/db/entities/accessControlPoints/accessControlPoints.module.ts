import { Module } from '@nestjs/common';

import { RDBRepositoryModule } from '@node-c/persistance-rdb';

import { AccessControlPointEntity } from './accessControlPoints.entity';
import { AccessControlPointsService } from './accessControlPoints.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RDBRepositoryModule.register({
      entityClass: AccessControlPointEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [AccessControlPointsService],
  exports: [AccessControlPointsService]
})
export class AccessControlPointsModule {}
