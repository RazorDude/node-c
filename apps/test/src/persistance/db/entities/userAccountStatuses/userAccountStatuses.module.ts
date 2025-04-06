import { Module } from '@nestjs/common';

import { RDBRepositoryModule } from '@node-c/persistance-rdb';

import { UserAccountStatusEntity } from './userAccountStatuses.entity';
import { UserAccountStatusesService } from './userAccountStatuses.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: UserAccountStatusEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [UserAccountStatusesService],
  exports: [UserAccountStatusesService]
})
export class UserAccountStatusesModule {}
