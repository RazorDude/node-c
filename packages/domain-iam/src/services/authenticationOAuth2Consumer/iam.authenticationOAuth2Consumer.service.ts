import { ConfigProviderService, LoggerService } from '@node-c/core';

import {
  IAMAuthenticationOAuth2ConsumerCompleteData,
  IAMAuthenticationOAuth2ConsumerCompleteOptions,
  IAMAuthenticationOAuth2ConsumerCompleteResult,
  IAMAuthenticationOAuth2ConsumerInitiateData,
  IAMAuthenticationOAuth2ConsumerInitiateOptions,
  IAMAuthenticationOAuth2ConsumerInitiateResult,
  IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenData,
  IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenResult,
  IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenData,
  IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenResult,
  IAMAuthenticationOAuth2ConsumerVerifyTokenOptions
} from './iam.authenticationOAuth2Consumer.definitions';

import { IAMAuthenticationConsumerService } from '../authenticationConsumer';
import { IAMAuthenticationOAuth2Service } from '../authenticationOAuth2';

/*
 * A service for integrating OAuth2 via other Node-C Apps as a consumer.
 * This service is intended for use by the consumer environment.
 */
export class IAMAuthenticationOAuth2ConsumerService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationConsumerService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
  }

  async complete(
    data: IAMAuthenticationOAuth2ConsumerCompleteData,
    options: IAMAuthenticationOAuth2ConsumerCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationOAuth2ConsumerCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationOAuth2ConsumerCompleteResult>;
  }

  async initiate(
    data: IAMAuthenticationOAuth2ConsumerInitiateData,
    options: IAMAuthenticationOAuth2ConsumerInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationOAuth2ConsumerInitiateResult> {
    return super.initiate(data, options) as Promise<IAMAuthenticationOAuth2ConsumerInitiateResult>;
  }

  async refreshExternalAccessToken(
    data: IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenResult> {
    return super.refreshExternalAccessToken(
      data
    ) as Promise<IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenResult>;
  }

  // verifyExternalAccessToken from the OAuth2 service
  async verifyExternalAccessToken(
    data: IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenData
  ): Promise<IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenResult> {
    return IAMAuthenticationOAuth2Service.prototype.verifyExternalAccessToken.call(this, data);
  }

  // verifyToken from the OAuth2 service
  protected async verifyToken(
    token: string,
    options: IAMAuthenticationOAuth2ConsumerVerifyTokenOptions
  ): Promise<IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenResult> {
    return IAMAuthenticationOAuth2Service.prototype.verifyToken.call(this, token, options);
  }
}
