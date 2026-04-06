import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { DataDBUserAccountStatusEntity } from './userAccountStatuses.entity';
import { DataDBUserAccountStatusesService } from './userAccountStatuses.service';

import { Constants } from '../../../../common/definitions';

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
