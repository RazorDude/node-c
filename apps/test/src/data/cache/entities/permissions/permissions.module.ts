import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { Constants } from '../../../../common/definitions/common.constants.js';

import {
  type DataCachePermission,
  DataCachePermissionSchema
} from './permissions.entity.js';
import { DataCachePermissionsEntityService } from './permissions.service.js';

@Module({
  imports: [
    RedisRepositoryModule.register<DataCachePermission>({
      dataModuleName: Constants.DATA_CACHE_MODULE_NAME,
      schema: DataCachePermissionSchema
    })
  ],
  providers: [DataCachePermissionsEntityService],
  exports: [DataCachePermissionsEntityService]
})
export class DataCachePermissionsEntityModule {}
