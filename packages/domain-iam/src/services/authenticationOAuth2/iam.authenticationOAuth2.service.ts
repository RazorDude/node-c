import crypto from 'crypto';

import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  HttpMethod,
  LoggerService,
  base64UrlEncode,
  httpRequest
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationOAuth2AccessTokenProviderResponseData,
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  IAMAuthenticationOAuth2GetPayloadsFromExternalTokensData,
  IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult,
  IAMAuthenticationOAuth2GetUserAuthenticationConfigResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult,
  IAMAuthenticationOAuth2VerifyExternalAccessTokenData,
  IAMAuthenticationOAuth2VerifyExternalAccessTokenResult
} from './iam.authenticationOAuth2.definitions';

import { Constants } from '../../common/definitions';
import { IAMAuthenticationService } from '../authentication';

// TODO: provider param name mapping, in case a specific provider has custom parameter names
// TODO: validate access_token flow - endpont
// TODO: refresh access_token flow - local (JWT), endpont
// TODO: move the verifyToken method to the base authentication service.
/**
 * This service is meant to support the OAuth2.0 flow w/ a PKCE challenge. The default, non-PKCE flow is intentionally not supported, in preparation for the upcoming OAuth2.0 spec.
 *
 * The default case assumes the user is found based on the decoded access token content after the complete method, but these settings can be overwritten in the config for the authService.
 *
 * This service is intended for use by the provider environment.
 *
 * 1. IAMAuthenticationOAuth2Service.initiate
 *
 * 2. (outside of this service) Save the challenge, verifier and state in the data, linking it to the provided user.
 *
 * 3. (outside of this service) Send an authorization code request on the prvodied URL to the OAuth2.0 provider.
 *
 * 4. (outside of this service) Receive a response with the state and an authorization code.
 *
 * 5. (outside of this service) Find the previously saved data for the user based on the state and send it to this service, along with the repsonse data.
 *
 * 6. IAMAuthenticationOAuth2Service.complete
 *
 * 7. (outside this service) Generate a local access & refresh JWT pair with the same expiry time as the provider tokens.
 *
 * 8. (outside this service) Save the provider's access token and (refersh or ID) tokens in the data along with the JWTs, linking them to the user.
 */
export class IAMAuthenticationOAuth2Service<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
    this.isLocal = false;
  }

  // TODO: the custom param mapping will potentially be needed here.
  /**
   * 6. IAMAuthenticationOAuth2Service.complete:
   *
   * Incoming for the http redirect - state & code
   *
   * 6.1. Send an access token request to the provider using the following params: grant_type=authorization_code, client_id, client_secret, redirect_uri, code, code_verifier.
   *
   * 6.2. Receive the access and refresh tokens - expires_in, access_token, scope, refresh_token OR id_token (OIDC only).
   *
   * 6.3. Return the access and (refresh or ID) tokens.
   */
  async complete(
    data: IAMAuthenticationOAuth2CompleteData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationOAuth2CompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationOAuth2CompleteResult> {
    const { configProvider, logger, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      accessTokenGrantUrl,
      allowedIncomingRedirectUris,
      clientId,
      clientSecret,
      redirectUri: configRedirectUri
    } = moduleConfig.authServiceSettings![serviceName].oauth2!;
    const logsPrefix = `[${moduleName}][${serviceName}][complete]`;
    if (!accessTokenGrantUrl) {
      logger.error(`${logsPrefix}: Access token grant URL not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    const { code, codeVerifier, redirectUri: incomingRedirectUri } = data;
    let redirectUri: string | undefined;
    if (incomingRedirectUri) {
      if (!allowedIncomingRedirectUris) {
        logger.error(`${logsPrefix}: Allowed incoming Redirect URIs not configured.`);
        throw new ApplicationError('Authentication failed.');
      }
      if (!allowedIncomingRedirectUris.includes(incomingRedirectUri)) {
        logger.error(`${logsPrefix}: Incoming redirect URI ${incomingRedirectUri} is not allowed.`);
        throw new ApplicationError('Authentication failed.');
      }
      redirectUri = incomingRedirectUri;
    } else {
      if (!configRedirectUri) {
        logger.error(`${logsPrefix}: Redirect URI not configured.`);
        throw new ApplicationError('Authentication failed.');
      }
      redirectUri = configRedirectUri;
    }
    const { data: providerResponseData, hasError } =
      await httpRequest<IAMAuthenticationOAuth2AccessTokenProviderResponseData>(accessTokenGrantUrl, {
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        },
        isFormData: true,
        method: HttpMethod.POST
      });
    if (hasError || !providerResponseData) {
      logger.error(`${logsPrefix}: Auhorization grant attempt failed for code "${code}".`, providerResponseData);
      throw new ApplicationError('Authentication failed.');
    }
    return {
      accessToken: providerResponseData.access_token,
      accessTokenExpiresIn: providerResponseData.expires_in,
      idToken: providerResponseData.id_token,
      mfaUsed: true,
      mfaValid: true,
      refreshToken: providerResponseData.refresh_token,
      scope: providerResponseData.scope,
      valid: true
    };
  }

  protected async generateChallenge(codeVerifier: string): Promise<string> {
    const buffer = await crypto.subtle.digest(
      Constants.OAUTH2_PKCE_CHALLENGE_HASH_METHOD,
      new TextEncoder().encode(codeVerifier)
    );
    return base64UrlEncode(buffer);
  }

  protected generateUrlEncodedString(length: number): string {
    const octetSize = Math.ceil((length * 3) / 4);
    const octets = crypto.getRandomValues(new Uint8Array(octetSize));
    return base64UrlEncode(octets.buffer).slice(0, length);
  }

  // TODO: introspect endpoint for non-JWTs
  async getPayloadsFromExternalTokens(
    data: IAMAuthenticationOAuth2GetPayloadsFromExternalTokensData
  ): Promise<IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult> {
    const { logger, moduleName, serviceName } = this;
    const { accessToken, idToken } = data;
    const returnData: IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult = {};
    if (accessToken) {
      const { accessTokenPayload, error } = await this.verifyExternalAccessToken({
        accessToken
      });
      if (error) {
        logger.error(
          `[${moduleName}][${serviceName}]: Method "getPayloadsFromExternalTokens" has produced an error:`,
          error
        );
        throw new ApplicationError(`[${moduleName}][${serviceName}]: Error getting data from external tokens.`);
      }
      returnData.accessTokenPayload = accessTokenPayload;
    }
    if (idToken) {
      const idTokenData = await this.verifyToken(idToken);
      returnData.idTokenPayload = idTokenData.content;
    }
    return returnData;
  }

  // Default config - plain OAuth2 without OIDC
  getUserAuthenticationConfig(): IAMAuthenticationOAuth2GetUserAuthenticationConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationOAuth2GetUserAuthenticationConfigResult = {
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
          resultFieldName: 'accessTokenPayload.username'
        },
        useReturnedTokens: true,
        validWithoutUser: false
      },
      [AppConfigDomainIAMAuthenticationStep.Initiate]: {
        cache: {
          populate: {
            data: [
              { cacheFieldName: 'codeVerifier', inputFieldName: 'result.codeVerifier' },
              { cacheFieldName: 'redirectUri', inputFieldName: 'result.redirectUri' }
            ]
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
    return ld.merge(defaultConfig, steps || {});
  }

  // TODO: the custom param mapping will potentially be needed here.
  /**
   * OAuth2.0 flow w/ a PKCE challenge:
   * 1. IAMAuthenticationOAuth2Service.initiate
   *
   * 1.1. Generate a PKCE code, code verifier for it and PKCE challenge based on them.
   *
   * 1.2. Generate a unique random "state" and a unique random "nonce" (for OIDC only, optional).
   *
   * 1.3. Generate an authorization code request URL. This URL contains the response_type=code, client_id, code_challenge, code_challenge_method, nonce, state, redirect_uri and scope. The code_challenge_method is usually S256.
   *
   * 1.4. Return the code, verifier, challenge, nonce, state and the URL.
   *
   * In this method, the only difference between the default OAuth2.0 flow and OIDC is that OIDC requires scope=oidc.
   */
  async initiate(
    data: IAMAuthenticationOAuth2InitiateData,
    options: IAMAuthenticationOAuth2InitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationOAuth2InitiateResult> {
    const { configProvider, logger, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      allowedIncomingRedirectUris,
      authorizationUrl,
      clientId,
      codeChallengeMethod,
      defaultScope,
      redirectUri: configRedirectUri
    } = moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { redirectUri: incomingRedirectUri, scope } = data;
    const { generateNonce, withPCKE } = options;
    const finalScope = scope || defaultScope;
    const logsPrefix = `[${moduleName}][${serviceName}][initiate]`;
    let redirectUri: string | undefined;
    if (!authorizationUrl) {
      logger.error(`${logsPrefix}: Authorization URL not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (incomingRedirectUri) {
      if (!allowedIncomingRedirectUris) {
        logger.error(`${logsPrefix}: Allowed incoming Redirect URIs not configured.`);
        throw new ApplicationError('Authentication failed.');
      }
      if (!allowedIncomingRedirectUris.includes(incomingRedirectUri)) {
        logger.error(`${logsPrefix}: Incoming redirect URI ${incomingRedirectUri} is not allowed.`);
        throw new ApplicationError('Authentication failed.');
      }
      redirectUri = incomingRedirectUri;
    } else {
      if (!configRedirectUri) {
        logger.error(`${logsPrefix}: Redirect URI not configured.`);
        throw new ApplicationError('Authentication failed.');
      }
      redirectUri = configRedirectUri;
    }
    if (!finalScope) {
      logger.error(`${logsPrefix}: Either a scope in thwe input, or a configured default scope, is required..`);
      throw new ApplicationError('Authentication failed.');
    }
    const state = this.generateUrlEncodedString(16);
    let challenge: string | undefined;
    let nonce: string | undefined;
    let verifier: string | undefined;
    let url =
      `${authorizationUrl}?` +
      'response_type=code&' +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(finalScope)}&` +
      `state=${state}`;
    if (withPCKE) {
      verifier = this.generateUrlEncodedString(parseInt(Constants.OAUTH2_CODE_VERIFIER_LENGTH, 10));
      challenge = await this.generateChallenge(verifier);
      url += `&code_challenge=${challenge}&code_challenge_method=${codeChallengeMethod}`;
    }
    if (generateNonce) {
      nonce = this.generateUrlEncodedString(16);
      url += `&nonce=${nonce}`;
    }
    return {
      authorizationCodeRequestURL: url,
      codeChallenge: challenge,
      codeVerifier: verifier,
      mfaUsed: true,
      mfaValid: true,
      nonce,
      redirectUri,
      state,
      valid: true
    };
  }

  // TODO: verification endpoint for non-JWTs
  async verifyExternalAccessToken(
    data: IAMAuthenticationOAuth2VerifyExternalAccessTokenData
  ): Promise<IAMAuthenticationOAuth2VerifyExternalAccessTokenResult> {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { accessTokenAudiences, issuerUri, verifyTokensLocally } =
      moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { accessToken } = data;
    if (!accessTokenAudiences) {
      throw new ApplicationError(
        `[${moduleName}][${serviceName}]: In method "verifyExternalAccessToken": accessTokenAudiences not configured.`
      );
    }
    if (!issuerUri) {
      throw new ApplicationError(
        `[${moduleName}][${serviceName}]:  In method "verifyExternalAccessToken": issuer URI not configured.`
      );
    }
    if (verifyTokensLocally) {
      const accessTokenData = await this.verifyToken(accessToken, {
        audiences: accessTokenAudiences,
        issuer: issuerUri
      });
      if (accessTokenData.error) {
        // return { error: Constants.TOKEN_EXPIRED_ERROR };
        return { error: accessTokenData.error };
      }
      return { accessTokenPayload: accessTokenData.content };
    }
    throw new ApplicationError(
      `[${moduleName}][${serviceName}]:  In method "verifyExternalAccessToken": verification via external endpoint not configured.`
    );
  }
}
