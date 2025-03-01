import { Module } from '@nestjs/common';

import { RDBRepositoryModule } from '@node-c/persistance-rdb';

import { GlobalConfigItemEntity } from './globalConfigItems.entity';
import { GlobalConfigItemsService } from './globalConfigItems.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    RDBRepositoryModule.register({
      entityClass: GlobalConfigItemEntity,
      persistanceModuleName: Constants.PERSISTANCE_DB_CONFIGS_MODULE_NAME
    })
  ],
  providers: [GlobalConfigItemsService],
  exports: [GlobalConfigItemsService]
})
export class GlobalConfigItemsModule {}
