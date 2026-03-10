import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants } from '@node-c/core';
import {
  IAMAuthenticationOktaService as BaseIAMAuthenticationOktaService,
  IAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult
} from '@node-c/domain-iam-okta';

import { IAMAuthenticationOktaUserFields } from './authenticationOkta.definitions';

import { Constants } from '../../../../common/definitions';
import { AuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class IAMAuthenticationOktaService extends BaseIAMAuthenticationOktaService<
  IAMAuthenticationOktaUserFields,
  IAMAuthenticationOktaUserFields
> {
  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, moduleName, Constants.DOMAIN_IAM_AUTH_OKTA_SERVICE_NAME);
  }

  async complete(
    data: IAMAuthenticationOktaCompleteData,
    options: IAMAuthenticationOktaCompleteOptions<IAMAuthenticationOktaUserFields>
  ): Promise<IAMAuthenticationOktaCompleteResult> {
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
    data: IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData
  ): Promise<IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult | null> {
    const parentResult = await super.getUserDataFromExternalTokenPayloads(data);
    if (!parentResult) {
      return null;
    }
    return {
      ...parentResult,
      accountStatusId: 1,
      assignedUserTypes: [{ id: 2 }],
      initialPassword: this.generateUrlEncodedString(30)
    } as unknown as IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;
  }
}
