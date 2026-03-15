import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  LoggerService
} from '@node-c/core';
import { IAMAuthenticationOAuth2Service } from '@node-c/domain-iam';

import ld from 'lodash';

import {
  IAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult,
  IAMAuthenticationOktaInitiateData,
  IAMAuthenticationOktaInitiateOptions,
  IAMAuthenticationOktaInitiateResult,
  IAMAuthenticationOktaRefreshExternalAccessTokenData,
  IAMAuthenticationOktaRefreshExternalAccessTokenResult
} from './iam.authenticationOkta.definitions';

/*
 * A service for integrating Okta OIDC auth. It extends the Domain-IAM-OAuth2.
 */
export class IAMAuthenticationOktaService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationOAuth2Service<CompleteContext, InitiateContext> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected moduleName: string,
    protected serviceName: string
  ) {
    super(configProvider, logger, moduleName, serviceName);
  }

  async complete(
    data: IAMAuthenticationOktaCompleteData,
    options: IAMAuthenticationOktaCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationOktaCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationOktaCompleteResult>;
  }

  async getUserDataFromExternalTokenPayloads(
    data: IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData
  ): Promise<IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult | null> {
    const { idTokenPayload } = data;
    if (!idTokenPayload) {
      return null;
    }
    const nameData = idTokenPayload.name.split(' ');
    return { email: idTokenPayload.email, firstName: nameData[0], lastName: nameData[nameData.length - 1] };
  }

  // Okta Auth via OIDC
  getUserCreateAccessTokenConfig(): IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult = {
      [AppConfigDomainIAMAuthenticationStep.Complete]: {
        authReturnsTokens: true,
        cache: {
          settings: {
            cacheFieldName: 'state',
            inputFieldName: 'data.state'
          },
          use: {
            data: { overwrite: true, use: true }
          }
        },
        createUser: true,
        decodeReturnedTokens: true,
        findUser: true,
        findUserBeforeAuth: false,
        findUserInAuthResultBy: {
          userFieldName: 'email',
          resultFieldName: 'idTokenPayload.email'
        },
        useReturnedTokens: true,
        validWithoutUser: false
      },
      [AppConfigDomainIAMAuthenticationStep.Initiate]: {
        cache: {
          populate: {
            data: [{ cacheFieldName: 'codeVerifier', inputFieldName: 'result.codeVerifier' }]
          },
          settings: {
            cacheFieldName: 'state',
            inputFieldName: 'result.state'
          }
        },
        findUser: false,
        stepResultPublicFields: ['authorizationCodeRequestURL'],
        validWithoutUser: true
      }
    };
    return ld.merge(defaultConfig, steps);
  }

  async initiate(
    data: IAMAuthenticationOktaInitiateData,
    options: IAMAuthenticationOktaInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationOktaInitiateResult> {
    return super.initiate(data, {
      ...options,
      generateNonce: true,
      withPCKE: true
    }) as Promise<IAMAuthenticationOktaInitiateResult>;
  }

  // TODO: this
  async refreshExternalAccessToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationOktaRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationOktaRefreshExternalAccessTokenResult> {
    throw new ApplicationError(
      `[${this.moduleName}][${this.serviceName}}]: Method "refreshExternalAccessToken" not implemented.`
    );
  }
}
