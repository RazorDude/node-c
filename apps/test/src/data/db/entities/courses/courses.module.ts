import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { CourseEntity } from './courses.entity';
import { CoursesService } from './courses.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: CourseEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [CoursesService],
  exports: [CoursesService]
})
export class CoursesModule {}
