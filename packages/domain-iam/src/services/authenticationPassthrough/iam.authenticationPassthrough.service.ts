import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ConfigProviderService,
  LoggerService
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationPassthroughCompleteData,
  IAMAuthenticationPassthroughCompleteOptions,
  IAMAuthenticationPassthroughCompleteResult,
  IAMAuthenticationPassthroughGetUserAuthenticationConfigResult,
  IAMAuthenticationPassthroughInitiateData,
  IAMAuthenticationPassthroughInitiateOptions,
  IAMAuthenticationPassthroughInitiateResult
} from './iam.authenticationPassthrough.definitions';

import { IAMAuthenticationService } from '../authentication';
/*
 * A service for skipping authentication in order to use the rest of the UserManager.authenticate functionality (passthrough).
 * This service is intended for use by the provider environment.
 */
export class IAMAuthenticationPassthroughService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected serviceName: string
  ) {
    super(configProvider, logger, moduleName);
    this.isLocal = true;
  }

  async complete(
    data: IAMAuthenticationPassthroughCompleteData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationPassthroughCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationPassthroughCompleteResult> {
    const returnData: IAMAuthenticationPassthroughCompleteResult = { mfaUsed: false, valid: true };
    if (data.externalAccessToken) {
      returnData.accessToken = data.externalAccessToken;
      if (data.externalAccessTokenExpiresIn) {
        returnData.accessTokenExpiresIn = data.externalAccessTokenExpiresIn;
      }
    }
    if (data.externalIdToken) {
      returnData.idToken = data.externalIdToken;
    }
    if (data.externalRefreshToken) {
      returnData.refreshToken = data.externalRefreshToken;
      if (data.externalRefreshTokenExpiresIn) {
        returnData.refreshTokenExpiresIn = data.externalRefreshTokenExpiresIn;
      }
    }
    return returnData;
  }

  /*
   * This config is intended for use by the provider environment.
   * User data from: provider
   * Internal tokens from: provider
   * External tokens from: consumer (optional)
   * Authentication happens in: consumer
   */
  getUserAuthenticationConfig(): IAMAuthenticationPassthroughGetUserAuthenticationConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationPassthroughGetUserAuthenticationConfigResult = {
      // this step accepts the external access tokens (if any) from the authData in the step input
      // and issues local tokens using that data
      [AppConfigDomainIAMAuthenticationStep.Complete]: {
        findUser: true,
        findUserBeforeAuth: true,
        validWithoutUser: false
      },
      // this step simply does nothing
      [AppConfigDomainIAMAuthenticationStep.Initiate]: {
        findUser: false,
        findUserBeforeAuth: false,
        validWithoutUser: true
      }
    };
    return ld.merge(defaultConfig, steps || {});
  }

  async initiate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationPassthroughInitiateData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationPassthroughInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationPassthroughInitiateResult> {
    return { mfaUsed: false, valid: true };
  }
}
