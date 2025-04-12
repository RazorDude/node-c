import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/persistance-typeorm';

import { AuthorizationPointEntity } from './authorizationPoints.entity';
import { AuthorizationPointsService } from './authorizationPoints.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: AuthorizationPointEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [AuthorizationPointsService],
  exports: [AuthorizationPointsService]
})
export class AuthorizationPointsModule {}
