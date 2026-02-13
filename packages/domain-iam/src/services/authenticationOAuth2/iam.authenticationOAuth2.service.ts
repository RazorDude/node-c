import crypto from 'crypto';

import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  base64UrlEncode,
  httpRequest
} from '@node-c/core';

import {
  OAuth2AuthenticateUserAuthData,
  OAuth2AuthenticateUserResult,
  OAuth2AuthenticateUserUserData,
  OAuth2GenerateAuthorizationURLData,
  OAuth2GenerateAuthorizationURLReturnData
} from './iam.authenticationOAuth2.definitions';

import { Constants } from '../../common/definitions';
import { IAMAuthenticationService } from '../authentication';

/*
 * This method is meant to support the OAuth2.0 flow w/ a PKCE challenge. The default, non-PKCE flow is intentionally not supported, in preparation for the upcoming OAuth2.0 spec.
 * 1. IAMAuthenticationOAuth2Service.generateAuthorizationURL
 * 2. (outside of this service) Save the challenge, verifier and state in the data, linking it to the provided user.
 * 3. (outside of this service) Send an authorization code request on the prvodied URL to the OAuth2.0 provider.
 * 4. (outside of this service) Receive a response with the state and an authorization code.
 * 5. (outside of this service) Find the previously saved data for the user based on the state and send it to this service, along with the repsonse data.
 * 6. IAMAuthenticationOAuth2Service.authenticateUser
 * 7. (outside this service) Generate a local access & refresh JWT pair with the same expiry time as the provider tokens.
 * 8. (outside this service) Save the provider's access token and (refersh or ID) tokens in the data along with the JWTs, linking them to the user.
 * TODO: provider param name mapping, in case a specific provider has custom parameter names
 * TODO: refresh access_token flow
 */
export class IAMAuthenticationOAuth2Service<
  AuthenticationUserFields extends object
> extends IAMAuthenticationService<AuthenticationUserFields> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected providerName: string
  ) {
    super(configProvider, moduleName);
  }

  /*
   * 6. IAMAuthenticationOAuth2Service.authenticateUser:
   * Incoming for the http redirect - state & code
   * 6.1. Send an access token request to the provider using the following params: grant_type=authorization_code, client_id, client_secret, redirect_uri, code, code_verifier.
   * 6.2. Receive the access and refresh tokens - expires_in, access_token, scope, refresh_token OR id_token (OIDC only).
   * 6.3. Return the access and (refresh or ID) tokens.
   */
  async authenticateUser(
    userData: OAuth2AuthenticateUserUserData<AuthenticationUserFields>,
    authData: OAuth2AuthenticateUserAuthData
  ): Promise<OAuth2AuthenticateUserResult> {
    const { configProvider, moduleName, providerName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { accessTokenGrantUrl, clientId, clientSecret, redirectUri } = moduleConfig.oauth2![providerName];
    const { code, codeVerifier } = authData;
    const userIdentifierField = authData.userIdentifierField || moduleConfig.defaultUserIdentifierField;
    const userIdentifierValue = userData[userIdentifierField as keyof AuthenticationUserFields];
    const { data: providerResponseData, hasError } = await httpRequest(accessTokenGrantUrl!, {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        // redirect_uri: base64UrlEncode(redirectUri!)
        redirect_uri: redirectUri
      },
      isFormData: true
    });
    if (hasError) {
      console.info(
        `[IAMAuthenticationOAuth2Service]: Auhorization grant attempt failed for user "${userIdentifierValue}".`,
        providerResponseData
      );
      throw new ApplicationError('Authorization failed.');
    }
    return { accessCode: '', valid: true };
  }

  /*
   * OAuth2.0 flow w/ a PKCE challenge:
   * 1. IAMAuthenticationOAuth2Service.generateAuthorizationURL
   * 1.1. Generate a PKCE code, code verifier for it and PKCE challenge based on them.
   * 1.2. Generate a unique random "state".
   * 1.3. Generate an authorization code request URL. This URL contains the response_type=code, client_id, code_challenge, code_challenge_method, state, redirect_uri and scope. The code_challenge_method is usually S256.
   * 1.4. Return the code, verifier, challenge, state and the URL.
   * In this method, the only difference between the default OAuth2.0 flow and OIDC is that OIDC requires scope=oidc.
   * TODO: the custom param mapping will potentially be needed here.
   */
  async generateAuthorizationCodeRequestURL(
    data?: OAuth2GenerateAuthorizationURLData
  ): Promise<OAuth2GenerateAuthorizationURLReturnData> {
    const { configProvider, moduleName, providerName } = this;
    const { authorizationUrl, clientId, codeChallengeMethod, defaultScope, redirectUri } = (
      configProvider.config.domain[moduleName] as AppConfigDomainIAM
    ).oauth2![providerName];
    const { scope } = data || {};
    const verifier = this.generateUrlEncodedString(Constants.OAUTH2_CODE_VERIFIER_LENGTH);
    const challenge = await this.generateChallenge(verifier);
    const state = this.generateUrlEncodedString(16);
    const url =
      `${authorizationUrl}?` +
      `client_id=${clientId}&` +
      `redirect_uri=${base64UrlEncode(redirectUri!)}&` +
      `scope=${scope || defaultScope}&` +
      `state=${state}&` +
      `code_challenge=${challenge}&` +
      `code_challenge_method=${codeChallengeMethod}`;
    return { authorizationCodeRequestURL: url, codeChallenge: challenge, codeVerifier: verifier, state };
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
}
