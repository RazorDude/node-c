import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { DataDBCourseTypeEntity } from './courseTypes.entity';
import { DataDBCourseTypesService } from './courseTypes.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBCourseTypeEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBCourseTypesService],
  exports: [DataDBCourseTypesService]
})
export class DataDBCourseTypesModule {}
