import { ApplicationError, ConfigProviderService, LoggerService } from '@node-c/core';
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

/**
 * A service for integrating Passthrough authentication via other Node-C Apps as a consumer.
 * This service is intended for use by the consumer environment.
 */
export class CoursePlatformStandaloneAuthenticationPassthroughConsumerService extends IAMAuthenticationPassthroughConsumerService<
  CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields,
  CoursePlatformStandaloneAuthenticationPassthroughConsumerUserFields
> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
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
