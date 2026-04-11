import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  LoggerService
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationPassthroughConsumerCompleteData,
  IAMAuthenticationPassthroughConsumerCompleteOptions,
  IAMAuthenticationPassthroughConsumerCompleteResult,
  IAMAuthenticationPassthroughConsumerGetUserAuthenticationConfigResult,
  IAMAuthenticationPassthroughConsumerInitiateData,
  IAMAuthenticationPassthroughConsumerInitiateOptions,
  IAMAuthenticationPassthroughConsumerInitiateResult,
  IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenData,
  IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenResult
} from './iam.authenticationPassthroughConsumer.definitions';

import { IAMAuthenticationConsumerService } from '../authenticationConsumer';

/**
 * A service for integrating Passthrough authentication via other Node-C Apps as a consumer.
 *
 * This service is intended for use by the consumer environment.
 */
export class IAMAuthenticationPassthroughConsumerService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationConsumerService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
  }

  async complete(
    data: IAMAuthenticationPassthroughConsumerCompleteData,
    options: IAMAuthenticationPassthroughConsumerCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationPassthroughConsumerCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationPassthroughConsumerCompleteResult>;
  }

  /**
   * This config is intended for use by the consumer environment.
   *
   * User data from: provider
   *
   * Internal tokens from: provider
   *
   * External tokens from: consumer (optional)
   *
   * Authentication happens in: consumer
   */
  getUserAuthenticationConfig(): IAMAuthenticationPassthroughConsumerGetUserAuthenticationConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationPassthroughConsumerGetUserAuthenticationConfigResult = {
      [AppConfigDomainIAMAuthenticationStep.Complete]: {
        authReturnsTokens: true,
        decodeReturnedTokens: true,
        findUser: true,
        findUserBeforeAuth: false,
        findUserInExternalTokenPayloads: true,
        useReturnedTokens: true,
        useReturnedTokensAsLocal: false,
        validWithoutUser: false
      },
      // this step simply does nothing
      [AppConfigDomainIAMAuthenticationStep.Initiate]: {
        findUser: false,
        validWithoutUser: true
      }
    };
    return ld.merge(defaultConfig, steps || {});
  }

  async initiate(
    data: IAMAuthenticationPassthroughConsumerInitiateData,
    options: IAMAuthenticationPassthroughConsumerInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationPassthroughConsumerInitiateResult> {
    return super.initiate(data, options) as Promise<IAMAuthenticationPassthroughConsumerInitiateResult>;
  }

  // This method must be implemented in the child class, since the external access tokens come from the consumer.
  async refreshExternalAccessToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenResult> {
    throw new ApplicationError(
      `[${this.moduleName}][${this.serviceName}}]: Method "refreshExternalAccessToken" not implemented.`
    );
  }
}
