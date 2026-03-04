import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService
} from '@node-c/core';
import { Constants, IAMAuthenticationOAuth2Service } from '@node-c/domain-iam';

import OktaJwtVerifier from '@okta/jwt-verifier';

import ld from 'lodash';

import {
  IAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetPayloadsFromExternalTokensData,
  IAMAuthenticationOktaGetPayloadsFromExternalTokensResult,
  IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaInitiateData,
  IAMAuthenticationOktaInitiateOptions,
  IAMAuthenticationOktaInitiateResult,
  IAMAuthenticationOktaRefreshExternalAccessTokenData,
  IAMAuthenticationOktaRefreshExternalAccessTokenResult,
  IAMAuthenticationOktaVerifyExternalAccessTokenData,
  IAMAuthenticationOktaVerifyExternalAccessTokenResult
} from './iam.authenticationOkta.definitions';

/*
 * A service for integrating Okta OIDC auth. It extends the Domain-IAM-OAuth2.
 */
export class IAMAuthenticationOktaService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationOAuth2Service<CompleteContext, InitiateContext> {
  protected oktaJWTVerifier: OktaJwtVerifier;

  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string,
    protected serviceName: string
  ) {
    super(configProvider, moduleName, serviceName);
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { issuerUri } = moduleConfig.authServiceSettings![serviceName].oauth2!;
    if (!issuerUri) {
      throw new ApplicationError(`[${moduleName}][${serviceName}]: Issuer URI not configured.`);
    }
    // TODO: custom jwks endpoint support
    this.oktaJWTVerifier = new OktaJwtVerifier({ issuer: issuerUri });
  }

  async complete(
    data: IAMAuthenticationOktaCompleteData,
    options: IAMAuthenticationOktaCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationOktaCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationOktaCompleteResult>;
  }

  async getPayloadsFromExternalTokens(
    data: IAMAuthenticationOktaGetPayloadsFromExternalTokensData
  ): Promise<IAMAuthenticationOktaGetPayloadsFromExternalTokensResult> {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { clientId } = moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { accessToken, idToken } = data;
    const returnData: IAMAuthenticationOktaGetPayloadsFromExternalTokensResult = {};
    if (accessToken) {
      const { accessTokenPayload, error } = await this.verifyExternalAccessToken({
        accessToken
      });
      if (error) {
        console.error(
          `[${this.moduleName}][${this.serviceName}]: Method "getUserDataFromExternalTokenPayloads" has produced an error:`,
          error
        );
        throw new ApplicationError(
          `[${this.moduleName}][${this.serviceName}]: Error getting data from external tokens.`
        );
      }
      returnData.accessTokenPayload = accessTokenPayload;
    }
    if (idToken) {
      const idTokenData = await this.oktaJWTVerifier.verifyIdToken(idToken, clientId);
      returnData.idTokenPayload = idTokenData;
    }
    return returnData;
  }

  async getUserDataFromExternalTokenPayloads(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData
  ): Promise<unknown> {
    throw new ApplicationError(
      `[${this.moduleName}][${this.serviceName}]: Method "getUserDataFromExternalTokenPayloads" not implemented.`
    );
  }

  // Okta Auth via OIDC
  getUserCreateAccessTokenConfig(): IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult = {
      [AppConfigDomainIAMAuthenticationStep.Complete]: {
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
        validWithoutUser: false
      },
      [AppConfigDomainIAMAuthenticationStep.Initialize]: {
        cache: {
          populate: {
            data: ['result.codeVerifier']
          },
          settings: {
            cacheFieldName: 'state',
            inputFieldName: 'result.state'
          }
        },
        findUser: false,
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
      `[${this.moduleName}][IAMAuthenticationService]: Method "refreshExternalAccessToken" not implemented.`
    );
  }

  async verifyExternalAccessToken(
    data: IAMAuthenticationOktaVerifyExternalAccessTokenData
  ): Promise<IAMAuthenticationOktaVerifyExternalAccessTokenResult> {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { accessTokenAudiences } = moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { accessToken } = data;
    if (!accessTokenAudiences) {
      throw new ApplicationError(
        `[${moduleName}][${serviceName}]: In method "verifyExternalAccessToken": accessTokenAudiences not configured.`
      );
    }
    const accessTokenData = await this.oktaJWTVerifier.verifyAccessToken(accessToken, accessTokenAudiences);
    if (accessTokenData.isExpired()) {
      return { error: Constants.TOKEN_EXPIRED_ERROR };
    }
    return { accessTokenPayload: accessTokenData };
  }
}
