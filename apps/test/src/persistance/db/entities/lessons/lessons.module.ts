import { Module } from '@nestjs/common';

import { TypeORMRepositoryModule } from '@node-c/persistance-typeorm';

import { LessonEntity } from './lessons.entity';
import { LessonsService } from './lessons.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: LessonEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [LessonsService],
  exports: [LessonsService]
})
export class LessonsModule {}
