import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationOktaService } from '@node-c/domain-iam-okta';

import {
  DomainIAMAuthenticationOktaCompleteData,
  DomainIAMAuthenticationOktaCompleteOptions,
  DomainIAMAuthenticationOktaCompleteResult,
  DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult,
  DomainIAMAuthenticationOktaUserFields
} from './authenticationOkta.definitions';

import { Constants } from '../../../../common/definitions';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class DomainIAMAuthenticationOktaService extends IAMAuthenticationOktaService<
  DomainIAMAuthenticationOktaUserFields,
  DomainIAMAuthenticationOktaUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: DataAuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_IAM_AUTH_OKTA_SERVICE_NAME);
  }

  async complete(
    data: DomainIAMAuthenticationOktaCompleteData,
    options: DomainIAMAuthenticationOktaCompleteOptions<DomainIAMAuthenticationOktaUserFields>
  ): Promise<DomainIAMAuthenticationOktaCompleteResult> {
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

  async getUserDataFromExternalTokenPayloads(
    data: DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData
  ): Promise<DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult | null> {
    const parentResult = await super.getUserDataFromExternalTokenPayloads(data);
    if (!parentResult) {
      return null;
    }
    return {
      ...parentResult,
      accountStatusId: 1,
      assignedUserTypes: [{ id: 2 }],
      initialPassword: this.generateUrlEncodedString(30)
    } as unknown as DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;
  }
}
