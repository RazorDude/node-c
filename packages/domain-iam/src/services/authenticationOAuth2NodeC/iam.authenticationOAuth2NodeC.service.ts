import { ConfigProviderService, LoggerService } from '@node-c/core';

import {
  IAMAuthenticationOAuth2NodeCCompleteData,
  IAMAuthenticationOAuth2NodeCCompleteOptions,
  IAMAuthenticationOAuth2NodeCCompleteResult,
  IAMAuthenticationOAuth2NodeCInitiateData,
  IAMAuthenticationOAuth2NodeCInitiateOptions,
  IAMAuthenticationOAuth2NodeCInitiateResult,
  IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenData,
  IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenResult
} from './iam.authenticationOAuth2NodeC.definitions';

import { IAMAuthenticationNodeCService } from '../authenticationNodeC';

/*
 * A service for integrating OAuth2 via other Node-C Apps.
 */
export class IAMAuthenticationOAuth2NodeCService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationNodeCService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
  }

  async complete(
    data: IAMAuthenticationOAuth2NodeCCompleteData,
    options: IAMAuthenticationOAuth2NodeCCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationOAuth2NodeCCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationOAuth2NodeCCompleteResult>;
  }

  async initiate(
    data: IAMAuthenticationOAuth2NodeCInitiateData,
    options: IAMAuthenticationOAuth2NodeCInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationOAuth2NodeCInitiateResult> {
    return super.initiate(data, options) as Promise<IAMAuthenticationOAuth2NodeCInitiateResult>;
  }

  async refreshExternalAccessToken(
    data: IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenResult> {
    return super.refreshExternalAccessToken(
      data
    ) as Promise<IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenResult>;
  }
}
