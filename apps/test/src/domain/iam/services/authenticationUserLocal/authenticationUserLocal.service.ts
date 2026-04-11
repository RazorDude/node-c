import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationUserLocalService as BaseIAMAuthenticationUserLocalService } from '@node-c/domain-iam';

import {
  DomainIAMAuthenticationUserLocalCompleteData,
  DomainIAMAuthenticationUserLocalCompleteOptions,
  DomainIAMAuthenticationUserLocalCompleteResult,
  DomainIAMAuthenticationUserLocalUserFields
} from './authenticationUserLocal.definitions';

import { Constants } from '../../../../common/definitions';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class DomainIAMAuthenticationUserLocalService extends BaseIAMAuthenticationUserLocalService<
  DomainIAMAuthenticationUserLocalUserFields,
  DomainIAMAuthenticationUserLocalUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: DataAuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_IAM_AUTH_USER_LOCAL_SERVICE_NAME);
  }

  async complete(
    data: DomainIAMAuthenticationUserLocalCompleteData,
    options: DomainIAMAuthenticationUserLocalCompleteOptions<DomainIAMAuthenticationUserLocalUserFields>
  ): Promise<DomainIAMAuthenticationUserLocalCompleteResult> {
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
