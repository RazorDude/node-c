import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { LessonTypeEntity } from './lessonTypes.entity';
import { LessonTypesService } from './lessonTypes.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: LessonTypeEntity,
      dataModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [LessonTypesService],
  exports: [LessonTypesService]
})
export class LessonTypesModule {}
