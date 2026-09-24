import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { DataDBLessonTypeEntity } from './lessonTypes.entity.js';
import { DataDBLessonTypesService } from './lessonTypes.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBLessonTypeEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBLessonTypesService],
  exports: [DataDBLessonTypesService]
})
export class DataDBLessonTypesModule {}
