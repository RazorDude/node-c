import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationOAuth2ConsumerService } from '@node-c/domain-iam';

import {
  CoursePlatformAuthenticationOktaConsumerCompleteData,
  CoursePlatformAuthenticationOktaConsumerCompleteOptions,
  CoursePlatformAuthenticationOktaConsumerCompleteResult,
  CoursePlatformAuthenticationOktaConsumerUserFields
} from './authenticationOktaConsumer.definitions';

import { Constants } from '../../../../common/definitions';
import { AuditUserLoginLogsService } from '../../../../data/audit/entities';

/*
 * Okta OIDC Auth via another Node-C service that acts as the provider.
 * User data from: provider
 * Internal tokens from: provider
 * External tokens from: provider
 * Authentication happens in: provider
 */
@Injectable()
export class CoursePlatformAuthenticationOktaConsumerService extends IAMAuthenticationOAuth2ConsumerService<
  CoursePlatformAuthenticationOktaConsumerUserFields,
  CoursePlatformAuthenticationOktaConsumerUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_CONSUMER_SERVICE_NAME);
  }

  async complete(
    data: CoursePlatformAuthenticationOktaConsumerCompleteData,
    options: CoursePlatformAuthenticationOktaConsumerCompleteOptions<CoursePlatformAuthenticationOktaConsumerUserFields>
  ): Promise<CoursePlatformAuthenticationOktaConsumerCompleteResult> {
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
