import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ConfigProviderService,
  LoggerService
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationOAuth2ConsumerCompleteData,
  IAMAuthenticationOAuth2ConsumerCompleteOptions,
  IAMAuthenticationOAuth2ConsumerCompleteResult,
  IAMAuthenticationOAuth2ConsumerGetUserAuthenticationConfigResult,
  IAMAuthenticationOAuth2ConsumerInitiateData,
  IAMAuthenticationOAuth2ConsumerInitiateOptions,
  IAMAuthenticationOAuth2ConsumerInitiateResult,
  IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenData,
  IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenResult,
  IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenData,
  IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenResult
} from './iam.authenticationOAuth2Consumer.definitions';

import { IAMAuthenticationConsumerService } from '../authenticationConsumer';
import { IAMAuthenticationOAuth2Service } from '../authenticationOAuth2';

/**
 * A service for integrating OAuth2 via other Node-C Apps as a consumer.
 *
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

  getUserAuthenticationConfig(): IAMAuthenticationOAuth2ConsumerGetUserAuthenticationConfigResult {
    const configFromParent = super.getUserAuthenticationConfig();
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    return ld.merge(
      configFromParent,
      {
        [AppConfigDomainIAMAuthenticationStep.Initiate]: {
          stepResultPublicFields: ['authorizationCodeRequestURL']
        }
      },
      steps || {}
    );
  }

  async initiate(
    data: IAMAuthenticationOAuth2ConsumerInitiateData,
    options: IAMAuthenticationOAuth2ConsumerInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationOAuth2ConsumerInitiateResult> {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { redirectUri } = moduleConfig.authServiceSettings![serviceName].oauth2!;
    return super.initiate(
      {
        ...data,
        ...(redirectUri ? { redirectUri } : {})
      },
      options
    ) as Promise<IAMAuthenticationOAuth2ConsumerInitiateResult>;
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
}
