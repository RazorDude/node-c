import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import { UserSubscriber } from './users.subscriber';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: UserEntity,
      dataModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [UsersService, UserSubscriber],
  exports: [UsersService, UserSubscriber]
})
export class UsersModule {}
