import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { DataDBPermissionEntity } from './permissions.entity.js';
import { DataDBPermissionsService } from './permissions.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBPermissionEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBPermissionsService],
  exports: [DataDBPermissionsService]
})
export class DataDBPermissionsModule {}
