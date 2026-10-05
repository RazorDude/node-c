import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataDBUserEntity } from './users.entity.js';
import { DataDBUsersService } from './users.service.js';
import { DataDBUserSubscriber } from './users.subscriber.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBUserEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBUsersService, DataDBUserSubscriber],
  exports: [DataDBUsersService, DataDBUserSubscriber]
})
export class DataDBUsersModule {}
