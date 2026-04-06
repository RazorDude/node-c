import { Module } from '@nestjs/common';

import { RedisRepositoryModule } from '@node-c/data-redis';

import { DataCacheFederatedTokenSchema } from './tokens.entity';
import { DataCacheFederatedTokensEntityService } from './tokens.service';

import { Constants } from '../../../../common/definitions';

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
