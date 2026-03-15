import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import {
  IAMAuthenticationUserLocalService as BaseIAMAuthenticationUserLocalService,
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult
} from '@node-c/domain-iam';

import { IAMAuthenticationUserLocalUserFields } from './authenticationUserLocal.definitions';

import { Constants } from '../../../../common/definitions';
import { AuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class IAMAuthenticationUserLocalService extends BaseIAMAuthenticationUserLocalService<
  IAMAuthenticationUserLocalUserFields,
  IAMAuthenticationUserLocalUserFields
> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_IAM_AUTH_USER_LOCAL_SERVICE_NAME);
  }

  async complete(
    data: IAMAuthenticationUserLocalCompleteData,
    options: IAMAuthenticationUserLocalCompleteOptions<IAMAuthenticationUserLocalUserFields>
  ): Promise<IAMAuthenticationUserLocalCompleteResult> {
    const result = await super.complete(data, options);
    await this.userLoginLogsService.create({
      datetime: new Date()
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, ''),
      userId: options.context.id
    });
    return result;
  }
}
