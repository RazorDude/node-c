import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/common/configProvider';
import { Constants } from '@node-c/common/definitions';
import { TokenManagerService as BaseTokenManagerService } from '@node-c/domain/iam';

import { CacheTokensEntityService } from '../../../../persistance/cache';

@Injectable()
export class IAMTokenManagerService extends BaseTokenManagerService<unknown, unknown, unknown> {
  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(Constants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    protected persistanceTokensService: CacheTokensEntityService
  ) {
    super(configProvider, moduleName, persistanceTokensService);
  }

  async test(): Promise<unknown> {
    return await this.persistanceTokensService?.find({ filters: { id: 10 } });
  }
}
