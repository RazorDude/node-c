import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { UserTypeEntity } from './userTypes.entity';
import { UserTypesService } from './userTypes.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: UserTypeEntity,
      dataModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [UserTypesService],
  exports: [UserTypesService]
})
export class UserTypesModule {}
