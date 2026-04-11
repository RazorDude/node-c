import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationPassthroughService } from '@node-c/domain-iam';

import {
  DomainIAMAuthenticationPassthroughCompleteData,
  DomainIAMAuthenticationPassthroughCompleteOptions,
  DomainIAMAuthenticationPassthroughCompleteResult,
  DomainIAMAuthenticationPassthroughUserFields
} from './authenticationPassthrough.definitions';

import { Constants } from '../../../../common/definitions';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class DomainIAMAuthenticationPassthroughService extends IAMAuthenticationPassthroughService<
  DomainIAMAuthenticationPassthroughUserFields,
  DomainIAMAuthenticationPassthroughUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: DataAuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_IAM_AUTH_PASSTHROUGH_SERVICE_NAME);
  }

  async complete(
    data: DomainIAMAuthenticationPassthroughCompleteData,
    options: DomainIAMAuthenticationPassthroughCompleteOptions<DomainIAMAuthenticationPassthroughUserFields>
  ): Promise<DomainIAMAuthenticationPassthroughCompleteResult> {
    const result = await super.complete(data, options);
    // await this.userLoginLogsService.create({
    //   datetime: new Date()
    //     .toISOString()
    //     .replace('T', ' ')
    //     .replace(/\.\d+Z$/, ''),
    //   userId: options.context.id
    // });
    return result;
  }
}
