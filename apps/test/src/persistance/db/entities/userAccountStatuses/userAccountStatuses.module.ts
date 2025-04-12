import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/persistance-typeorm';

import { UserAccountStatusEntity } from './userAccountStatuses.entity';
import { UserAccountStatusesService } from './userAccountStatuses.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: UserAccountStatusEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [UserAccountStatusesService],
  exports: [UserAccountStatusesService]
})
export class UserAccountStatusesModule {}
