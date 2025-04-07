import { Module } from '@nestjs/common';

import { TypeORMRepositoryModule } from '@node-c/persistance-typeorm';

import { CourseEntity } from './courses.entity';
import { CoursesService } from './courses.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: CourseEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [CoursesService],
  exports: [CoursesService]
})
export class CoursesModule {}
