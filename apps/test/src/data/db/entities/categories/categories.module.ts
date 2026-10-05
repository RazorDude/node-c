import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataDBCategoryEntity } from './categories.entity.js';
import { DataDBCategoriesService } from './categories.service.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBCategoryEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBCategoriesService],
  exports: [DataDBCategoriesService]
})
export class DataDBCategoriesModule {}
