import { Module } from '@nestjs/common';

import { RDBRepositoryModule } from '@node-c/persistance-rdb';

import { LessonTypeEntity } from './lessonTypes.entity';
import { LessonTypesService } from './lessonTypes.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: LessonTypeEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [LessonTypesService],
  exports: [LessonTypesService]
})
export class LessonTypesModule {}
