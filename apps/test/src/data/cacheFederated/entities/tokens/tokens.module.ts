import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataCacheFederatedTokenSchema } from './tokens.entity.js';
import { DataCacheFederatedTokensEntityService } from './tokens.service.js';

@Module({
  imports: [
    RedisRepositoryModule.register({
      dataModuleName: Constants.DATA_CACHE_FEDERATED_MODULE_NAME,
      schema: DataCacheFederatedTokenSchema
    })
  ],
  providers: [DataCacheFederatedTokensEntityService],
  exports: [DataCacheFederatedTokensEntityService]
})
export class DataCacheFederatedTokensEntityModule {}
