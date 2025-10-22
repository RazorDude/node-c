import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/persistance-typeorm';

import { CategoryEntity } from './categories.entity';
import { CategoriesService } from './categories.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME,
      entityClass: CategoryEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_MODULE_NAME
    })
  ],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
