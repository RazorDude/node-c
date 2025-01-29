import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/common/configProvider';
import { Constants } from '@node-c/common/definitions';
import { IAMTokenManagerService as BaseIAMTokenManagerService } from '@node-c/domain/iam';

import { CacheToken, CacheTokensEntityService } from '../../../../persistance/cache';

@Injectable()
export class IAMTokenManagerService extends BaseIAMTokenManagerService<CacheToken, unknown, unknown> {
  static injectionToken = Constants.AUTHENTICATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE;

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
