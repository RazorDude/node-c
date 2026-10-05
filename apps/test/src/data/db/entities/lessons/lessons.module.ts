import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataDBLessonEntity } from './lessons.entity.js';
import { DataDBLessonsService } from './lessons.service.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBLessonEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBLessonsService],
  exports: [DataDBLessonsService]
})
export class DataDBLessonsModule {}
