import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataOktaMockUserEntity } from './users.entity.js';
import { DataOktaMockUsersService } from './users.service.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_OKTA_MOCK_MODULE_CONNECTION_NAME,
      entityClass: DataOktaMockUserEntity,
      dataModuleName: Constants.DATA_OKTA_MOCK_MODULE_NAME
    })
  ],
  providers: [DataOktaMockUsersService],
  exports: [DataOktaMockUsersService]
})
export class DataOktaMockUsersModule {}
