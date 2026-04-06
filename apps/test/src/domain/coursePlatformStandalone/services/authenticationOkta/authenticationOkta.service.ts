import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationOktaService } from '@node-c/domain-iam-okta';

import {
  DomainCoursePlatformStandaloneAuthenticationOktaCompleteData,
  DomainCoursePlatformStandaloneAuthenticationOktaCompleteOptions,
  DomainCoursePlatformStandaloneAuthenticationOktaCompleteResult,
  DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult,
  DomainCoursePlatformStandaloneAuthenticationOktaUserFields
} from './authenticationOkta.definitions';

import { Constants } from '../../../../common/definitions';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities';

/**
 * Okta OIDC authentication as a standalone service. Its output can be used for the Passthrough service.
 */
@Injectable()
export class DomainCoursePlatformStandaloneAuthenticationOktaService extends IAMAuthenticationOktaService<
  DomainCoursePlatformStandaloneAuthenticationOktaUserFields,
  DomainCoursePlatformStandaloneAuthenticationOktaUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: DataAuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME);
  }

  async complete(
    data: DomainCoursePlatformStandaloneAuthenticationOktaCompleteData,
    options: DomainCoursePlatformStandaloneAuthenticationOktaCompleteOptions<DomainCoursePlatformStandaloneAuthenticationOktaUserFields>
  ): Promise<DomainCoursePlatformStandaloneAuthenticationOktaCompleteResult> {
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
    data: DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsData
  ): Promise<DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult | null> {
    const parentResult = await super.getUserDataFromExternalTokenPayloads(data);
    if (!parentResult) {
      return null;
    }
    return {
      ...parentResult,
      accountStatusId: 1,
      assignedUserTypes: [{ id: 2 }],
      initialPassword: this.generateUrlEncodedString(30)
    } as unknown as DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;
  }
}
