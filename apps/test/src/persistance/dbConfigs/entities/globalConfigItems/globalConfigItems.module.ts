import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/persistance-typeorm';

import { GlobalConfigItemEntity } from './globalConfigItems.entity';
import { GlobalConfigItemsService } from './globalConfigItems.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.PERSISTANCE_DB_CONFIGS_MODULE_CONNECTION_NAME,
      entityClass: GlobalConfigItemEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_CONFIGS_MODULE_NAME
    })
  ],
  providers: [GlobalConfigItemsService],
  exports: [GlobalConfigItemsService]
})
export class GlobalConfigItemsModule {}
