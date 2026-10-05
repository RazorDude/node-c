import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataDBUserAccountStatusEntity } from './userAccountStatuses.entity.js';
import { DataDBUserAccountStatusesService } from './userAccountStatuses.service.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBUserAccountStatusEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBUserAccountStatusesService],
  exports: [DataDBUserAccountStatusesService]
})
export class DataDBUserAccountStatusesModule {}
