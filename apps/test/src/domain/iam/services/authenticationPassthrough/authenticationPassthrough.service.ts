import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationPassthroughService as BaseIAMAuthenticationPassthroughService } from '@node-c/domain-iam';

import {
  IAMAuthenticationPassthroughCompleteData,
  IAMAuthenticationPassthroughCompleteOptions,
  IAMAuthenticationPassthroughCompleteResult,
  IAMAuthenticationPassthroughUserFields
} from './authenticationPassthrough.definitions';

import { Constants } from '../../../../common/definitions';
import { AuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class IAMAuthenticationPassthroughService extends BaseIAMAuthenticationPassthroughService<
  IAMAuthenticationPassthroughUserFields,
  IAMAuthenticationPassthroughUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_IAM_AUTH_PASSTHROUGH_SERVICE_NAME);
  }

  async complete(
    data: IAMAuthenticationPassthroughCompleteData,
    options: IAMAuthenticationPassthroughCompleteOptions<IAMAuthenticationPassthroughUserFields>
  ): Promise<IAMAuthenticationPassthroughCompleteResult> {
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
