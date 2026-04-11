import { Inject } from '@nestjs/common';
import { ApplicationError, ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationPassthroughConsumerService } from '@node-c/domain-iam';

import {
  CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteData,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteOptions,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteResult,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateData,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateOptions,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateResult,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerRefreshExternalAccessTokenData,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerRefreshExternalAccessTokenResult,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields
} from './authenticationPassthroughConsumer.definitions';

import { Constants } from '../../../../common/definitions';

/**
 * A service for integrating Passthrough authentication via other Node-C Apps as a consumer.
 * This service is intended for use by the consumer environment.
 */
export class CoursePlatformStandaloneAuthenticationPassthroughConsumerService extends IAMAuthenticationPassthroughConsumerService<
  CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME) moduleName: string
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME);
  }

  async complete(
    data: CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteData,
    options: CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteOptions<CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields>
  ): Promise<CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteResult> {
    return super.complete(
      data,
      options
    ) as Promise<CoursePlatformStandaloneAuthenticationPassthroughConsumerCompleteResult>;
  }

  async initiate(
    data: CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateData,
    options: CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateOptions<CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields>
  ): Promise<CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateResult> {
    return super.initiate(
      data,
      options
    ) as Promise<CoursePlatformStandaloneAuthenticationPassthroughConsumerInitiateResult>;
  }

  // This method must be implemented in the child class, since the external access tokens come from the consumer.
  async refreshExternalAccessToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: CoursePlatformStandaloneAuthenticationPassthroughConsumerRefreshExternalAccessTokenData
  ): Promise<CoursePlatformStandaloneAuthenticationPassthroughConsumerRefreshExternalAccessTokenResult> {
    throw new ApplicationError(
      `[${this.moduleName}][${this.serviceName}}]: Method "refreshExternalAccessToken" not implemented.`
    );
  }
}
