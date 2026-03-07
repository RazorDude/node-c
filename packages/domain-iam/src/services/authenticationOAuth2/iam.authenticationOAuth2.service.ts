import crypto from 'crypto';

import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  HttpMethod,
  base64UrlEncode,
  httpRequest
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationOAuth2AccessTokenProviderResponseData,
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  // IAMAuthenticationOAuth2GetPayloadsFromExternalTokensData,
  // IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult,
  // IAMAuthenticationOAuth2GetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult
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
 * TODO: validate access_token flow - local (JWT), endpont
 * TODO: refresh access_token flow - local (JWT), endpont
 * TODO: introspect flow - local (JWT), endpoint
 */
export class IAMAuthenticationOAuth2Service<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected serviceName: string
  ) {
    super(configProvider, moduleName);
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
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { accessTokenGrantUrl, clientId, clientSecret, redirectUri } =
      moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { code, codeVerifier } = data;
    const { data: providerResponseData, hasError } =
      await httpRequest<IAMAuthenticationOAuth2AccessTokenProviderResponseData>(accessTokenGrantUrl!, {
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          // redirect_uri: base64UrlEncode(redirectUri!)
          redirect_uri: redirectUri
        },
        isFormData: true,
        method: HttpMethod.POST
      });
    if (hasError || !providerResponseData) {
      console.error(
        `[IAMAuthenticationOAuth2Service]: Auhorization grant attempt failed for code "${code}".`,
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

  // async getPayloadsFromExternalTokens(
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _data: IAMAuthenticationOAuth2GetPayloadsFromExternalTokensData
  // ): Promise<IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult> {
  //   const { externalTokenManagementService } = this;
  //   throw new ApplicationError(
  //     `[${this.moduleName}][IAMAuthenticationService]: Method "getPayloadsFromExternalTokens" not implemented.`
  //   );
  // }

  // async getUserDataFromExternalTokenPayloads(
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _data: IAMAuthenticationOAuth2GetUserDataFromExternalTokenPayloadsData
  // ): Promise<unknown> {
  //   throw new ApplicationError(
  //     `[${this.moduleName}][IAMAuthenticationService]: Method "getUserDataFromExternalTokenPayloads" not implemented.`
  //   );
  // }

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
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { authorizationUrl, clientId, codeChallengeMethod, defaultScope, redirectUri } =
      moduleConfig.authServiceSettings![serviceName].oauth2!;
    const { scope } = data;
    const { generateNonce, withPCKE } = options;
    const state = this.generateUrlEncodedString(16);
    let challenge: string | undefined;
    let nonce: string | undefined;
    let verifier: string | undefined;
    let url =
      `${authorizationUrl}?` +
      `client_id=${clientId}&` +
      `redirect_uri=${base64UrlEncode(redirectUri!)}&` +
      `scope=${scope || defaultScope}&` +
      `state=${state}`;
    if (withPCKE) {
      verifier = this.generateUrlEncodedString(Constants.OAUTH2_CODE_VERIFIER_LENGTH);
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
}
