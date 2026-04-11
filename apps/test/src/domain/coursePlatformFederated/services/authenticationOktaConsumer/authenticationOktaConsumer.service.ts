import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationOAuth2ConsumerService } from '@node-c/domain-iam';

import {
  DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteData,
  DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteOptions,
  DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteResult,
  DomainCoursePlatformFederatedAuthenticationOktaConsumerUserFields
} from './authenticationOktaConsumer.definitions';

import { Constants } from '../../../../common/definitions';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities';

/**
 * Okta OIDC Auth via another Node-C service that acts as the provider.
 * User data from: provider
 * Internal tokens from: provider
 * External tokens from: provider
 * Authentication happens in: provider
 */
@Injectable()
export class DomainCoursePlatformFederatedAuthenticationOktaConsumerService extends IAMAuthenticationOAuth2ConsumerService<
  DomainCoursePlatformFederatedAuthenticationOktaConsumerUserFields,
  DomainCoursePlatformFederatedAuthenticationOktaConsumerUserFields
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
    data: DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteData,
    options: DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteOptions<DomainCoursePlatformFederatedAuthenticationOktaConsumerUserFields>
  ): Promise<DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteResult> {
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
