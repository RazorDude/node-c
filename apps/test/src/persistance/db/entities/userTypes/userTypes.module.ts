import { Module } from '@nestjs/common';

import { RDBRepositoryModule } from '@node-c/persistance-rdb';

import { UserTypeEntity } from './userTypes.entity';
import { UserTypesService } from './userTypes.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RDBRepositoryModule.register({
      entityClass: UserTypeEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [UserTypesService],
  exports: [UserTypesService]
})
export class UserTypesModule {}
