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

import * as jwt from 'jsonwebtoken';
import ld from 'lodash';

import {
  IAMAuthenticationOAuth2AccessTokenProviderResponseData,
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  IAMAuthenticationOAuth2GetPayloadsFromExternalTokensData,
  IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult,
  IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult,
  IAMAuthenticationOAuth2VerifyExternalAccessTokenData,
  IAMAuthenticationOAuth2VerifyExternalAccessTokenResult
} from './iam.authenticationOAuth2.definitions';

import { Constants } from '../../common/definitions';
import { IAMAuthenticationService } from '../authentication';

/*
 * This method is meant to support the OAuth2.0 flow w/ a PKCE challenge. The default, non-PKCE flow is intentionally not supported, in preparation for the upcoming OAuth2.0 spec.
 * The default case assumes the user is found based on the decoded access token content after the complete method, but these settings can be overwritten in the config for the authService.
 * 1. IAMAuthenticationOAuth2Service.initiate
 * 2. (outside of this service) Save the challenge, verifier and state in the data, linking it to the provided user.
 * 3. (outside of this service) Send an authorization code request on the prvodied URL to the OAuth2.0 provider.
 * 4. (outside of this service) Receive a response with the state and an authorization code.
 * 5. (outside of this service) Find the previously saved data for the user based on the state and send it to this service, along with the repsonse data.
 * 6. IAMAuthenticationOAuth2Service.complete
 * 7. (outside this service) Generate a local access & refresh JWT pair with the same expiry time as the provider tokens.
 * 8. (outside this service) Save the provider's access token and (refersh or ID) tokens in the data along with the JWTs, linking them to the user.
 * *
 * TODO: provider param name mapping, in case a specific provider has custom parameter names
 * TODO: validate access_token flow - endpont
 * TODO: refresh access_token flow - local (JWT), endpont
 */
export class IAMAuthenticationOAuth2Service<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected serviceName: string
  ) {
    super(configProvider, logger, moduleName);
    this.isLocal = false;
  }

  /*
   * 6. IAMAuthenticationOAuth2Service.complete:
   * Incoming for the http redirect - state & code
   * 6.1. Send an access token request to the provider using the following params: grant_type=authorization_code, client_id, client_secret, redirect_uri, code, code_verifier.
   * 6.2. Receive the access and refresh tokens - expires_in, access_token, scope, refresh_token OR id_token (OIDC only).
   * 6.3. Return the access and (refresh or ID) tokens.
   * TODO: the custom param mapping will potentially be needed here.
   */
  async complete(
    data: IAMAuthenticationOAuth2CompleteData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationOAuth2CompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationOAuth2CompleteResult> {
    const { configProvider, logger, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { accessTokenGrantUrl, clientId, clientSecret, redirectUri } =
      moduleConfig.authServiceSettings![serviceName].oauth2!;
    if (!accessTokenGrantUrl) {
      logger.error(`[${moduleName}][${serviceName}]: Access token grant URL not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (!redirectUri) {
      logger.error(`[${moduleName}][${serviceName}]: Redirect URI not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    const { code, codeVerifier } = data;
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
      logger.error(
        `[${moduleName}][${serviceName}]: Auhorization grant attempt failed for code "${code}".`,
        providerResponseData
      );
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
  getUserCreateAccessTokenConfig(): IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult = {
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
    return ld.merge(defaultConfig, steps || {});
  }

  /*
   * OAuth2.0 flow w/ a PKCE challenge:
   * 1. IAMAuthenticationOAuth2Service.initiate
   * 1.1. Generate a PKCE code, code verifier for it and PKCE challenge based on them.
   * 1.2. Generate a unique random "state" and a unique random "nonce" (for OIDC only, optional).
   * 1.3. Generate an authorization code request URL. This URL contains the response_type=code, client_id, code_challenge, code_challenge_method, nonce, state, redirect_uri and scope. The code_challenge_method is usually S256.
   * 1.4. Return the code, verifier, challenge, nonce, state and the URL.
   * In this method, the only difference between the default OAuth2.0 flow and OIDC is that OIDC requires scope=oidc.
   * TODO: the custom param mapping will potentially be needed here.
   */
  async initiate(
    data: IAMAuthenticationOAuth2InitiateData,
    options: IAMAuthenticationOAuth2InitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationOAuth2InitiateResult> {
    const { configProvider, logger, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { authorizationUrl, clientId, codeChallengeMethod, defaultScope, redirectUri } =
      moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { scope } = data;
    const { generateNonce, withPCKE } = options;
    const finalScope = scope || defaultScope;
    if (!authorizationUrl) {
      logger.error(`[${moduleName}][${serviceName}]: Authorization URL not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (!redirectUri) {
      logger.error(`[${moduleName}][${serviceName}]: Redirect URI not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (!finalScope) {
      logger.error(
        `[${moduleName}][${serviceName}]: Either a scope in thwe input, or a configured default scope, is required..`
      );
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

  protected async verifyToken<DecodedTokenContent = unknown>(
    token: string,
    options?: { audiences?: string[]; issuer?: string; secret?: string }
  ): Promise<{ content?: DecodedTokenContent; error?: unknown }> {
    const { audiences, issuer, secret } = options || {};
    let returnData: { content?: DecodedTokenContent; error?: unknown } = {};
    if (secret) {
      returnData = await new Promise<{ content?: DecodedTokenContent; error?: unknown }>(resolve => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            resolve({ content: decoded as DecodedTokenContent, error: err });
          }
          resolve({ content: decoded as DecodedTokenContent });
        });
      });
    } else {
      const tokenContent = jwt.decode(token) as DecodedTokenContent & { aud?: string; exp?: number; iss?: string };
      if (tokenContent.exp) {
        // tokenContent.exp < new Date().valueOf()
        let currentTimeStamp = `${new Date().valueOf()}`;
        let expString = `${tokenContent.exp}`;
        if (expString.length < currentTimeStamp.length) {
          currentTimeStamp = currentTimeStamp.substring(0, expString.length);
        } else if (expString.length > currentTimeStamp.length) {
          expString = expString.substring(0, currentTimeStamp.length);
        }
        if (parseInt(expString, 10) < parseInt(currentTimeStamp, 10)) {
          returnData.error = Constants.TOKEN_EXPIRED_ERROR;
        }
      }
      if (tokenContent.aud && audiences && !audiences.includes(tokenContent.aud)) {
        returnData.error = Constants.TOKEN_MISMATCHED_AUDIENCES_ERROR;
      }
      if (tokenContent.iss && issuer && issuer !== tokenContent.iss) {
        returnData.error = Constants.TOKEN_MISMATCHED_ISSUER_ERROR;
      }
      returnData.content = tokenContent;
    }
    return returnData;
  }
}
