import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants } from '@node-c/core';
import { IAMAuthenticationLocalService as BaseAuthenticationLocalService } from '@node-c/domain-iam';

import { CacheUser } from '../../../../persistance/cache';

@Injectable()
export class IAMAuthenticationLocalService extends BaseAuthenticationLocalService<CacheUser & { password: string }> {
  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(Constants.DOMAIN_MODULE_NAME)
    protected moduleName: string
  ) {
    super(configProvider, moduleName);
  }
}
