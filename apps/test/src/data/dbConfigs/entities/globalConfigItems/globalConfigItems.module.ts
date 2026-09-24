import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { DataDBConfigsGlobalConfigItemEntity } from './globalConfigItems.entity.js';
import { DataDBConfigsGlobalConfigItemsService } from './globalConfigItems.service.js';

import { Constants } from '../../../../common/definitions/common.constants.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_CONFIGS_MODULE_CONNECTION_NAME,
      entityClass: DataDBConfigsGlobalConfigItemEntity,
      dataModuleName: Constants.DATA_DB_CONFIGS_MODULE_NAME
    })
  ],
  providers: [DataDBConfigsGlobalConfigItemsService],
  exports: [DataDBConfigsGlobalConfigItemsService]
})
export class DataDBConfigsGlobalConfigItemsModule {}
