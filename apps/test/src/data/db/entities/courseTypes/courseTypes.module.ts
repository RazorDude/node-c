import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { CourseTypeEntity } from './courseTypes.entity';
import { CourseTypesService } from './courseTypes.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: CourseTypeEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [CourseTypesService],
  exports: [CourseTypesService]
})
export class CourseTypesModule {}
