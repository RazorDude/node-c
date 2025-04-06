import { Module } from '@nestjs/common';

import { RDBRepositoryModule } from '@node-c/persistance-rdb';

import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import { UserSubscriber } from './users.subscriber';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: UserEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [UsersService, UserSubscriber],
  exports: [UsersService, UserSubscriber]
})
export class UsersModule {}
