import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheCourse, DataCacheCourseSchema } from './courses.entity.js';
import { DataCacheCoursesEntityService } from './courses.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    RedisRepositoryModule.register<DataCacheCourse>({
      dataModuleName: Constants.DATA_CACHE_MODULE_NAME,
      schema: DataCacheCourseSchema
    })
  ],
  providers: [DataCacheCoursesEntityService],
  exports: [DataCacheCoursesEntityService]
})
export class DataCacheCoursesEntityModule {}
