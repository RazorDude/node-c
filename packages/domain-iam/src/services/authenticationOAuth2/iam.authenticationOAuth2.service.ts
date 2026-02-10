import crypto from 'crypto';

import { AppConfigDomainIAM, ApplicationError, ConfigProviderService } from '@node-c/core';

import {
  OAuth2AuthenticateUserAuthData,
  OAuth2AuthenticateUserResult,
  OAuth2AuthenticateUserUserData
} from './iam.authenticationOAuth2.definitions';

import { IAMAuthenticationService } from '../authentication';

// TODO: provider param name mapping
// TODO: refresh access_token flow
/*
 * This method is meant to support the OAuth2.0 flow w/ a PKCE challenge. The default, non-PKCE flow is intentionally not supported, in preparation for the upcoming OAuth2.0 spec.
 * 1. IAMAuthenticationOAuth2Service.generateAuthorizationURL
 * 2. (outside of this service) Save the challenge, verifier and state in the persistance, linking it to the provided user.
 * 3. (outside of this service) Send an authorization code request on the prvodied URL to the OAuth2.0 provider.
 * 4. (outside of this service) Receive a response with the state and an authorization code.
 * 5. (outside of this service) Find the previously saved data for the user based on the state and send it to this service, along with the repsonse data.
 * 6. IAMAuthenticationOAuth2Service.authenticateUser
 * 7. (outside this service) Generate a local access & refresh JWT pair with the same expiry time as the provider tokens.
 * 8. (outside this service) Save the provider's access token and (refersh or ID) tokens in the persistance along with the JWTs, linking them to the user.
 */
export class IAMAuthenticationOAuth2Service<
  AuthenticationUserFields extends object
> extends IAMAuthenticationService<AuthenticationUserFields> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string
    // TODO: inject the providerService
  ) {
    super(configProvider, moduleName);
  }

  /*
   * 6. IAMAuthenticationOAuth2Service.authenticateUser:
   * 6.1. Send an access token request to the provider using the following params: grant_type=authorization_code, client_id, client_secret, redirect_uri, code, code_verifier.
   * 6.2. Receive the access and refresh tokens - expires_in, access_token, scope, refresh_token OR id_token (OIDC only).
   * 6.3. Return the access and (refresh or ID) tokens.
   */
  async authenticateUser(
    userData: OAuth2AuthenticateUserUserData<AuthenticationUserFields>,
    authData: OAuth2AuthenticateUserAuthData
  ): Promise<OAuth2AuthenticateUserResult> {
    const { configProvider, moduleName } = this;
    const { defaultUserIdentifierField, userPasswordHMACAlgorithm, userPasswordSecret } = configProvider.config.domain[
      moduleName
    ] as AppConfigDomainIAM;
    const { password: userPassword } = userData;
    const { password: authPassword } = authData;
    const userIdentifierField = authData.userIdentifierField || defaultUserIdentifierField;
    const userIdentifierValue = userData[userIdentifierField as keyof AuthenticationUserFields];
    let wrongPassword = false;
    if (!userPasswordHMACAlgorithm || !userPasswordSecret || !userPassword) {
      wrongPassword = true;
    } else {
      const computedPassword = crypto
        .createHmac(userPasswordHMACAlgorithm, userPasswordSecret)
        .update(`${authPassword}`)
        .digest('hex')
        .toString();
      if (computedPassword !== userPassword) {
        wrongPassword = true;
      }
    }
    if (wrongPassword) {
      console.info(
        `[IAMAuthenticationOAuth2Service]: Login attempt failed for user "${userIdentifierValue}" - wrong password.`
      );
      throw new ApplicationError('Invalid user identifier or password.');
    }
    return { accessCode: '', valid: true };
  }

  protected base64urlEncode(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /*
   * OAuth2.0 flow w/ a PKCE challenge:
   * 1. IAMAuthenticationOAuth2Service.generateAuthorizationURL
   * 1.1. Generate a PKCE code, code verifier for it and PKCE challenge based on them.
   * 1.2. Generate a unique random "state".
   * 1.3. Generate an authorization code request URL. This URL contains the response_type=code, client_id, code_challenge, code_challenge_method, state, redirect_uri and scope. The code_challenge_method is usually S256.
   * 1.4. Return the code, verifier, challenge, state and the URL.
   */
  async generateAuthorizationURL(): Promise<{ authorizationCodeRequestURL: string; codeChallenge: string }> {
    const verifier = this.generateVerifier(128);
    const challenge = await this.generateChallenge(verifier);
    return { authorizationCodeRequestURL: '', codeChallenge: '' };
  }

  protected async generateChallenge(codeVerifier: string): Promise<string> {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    return this.base64urlEncode(buffer);
  }

  protected generateVerifier(length: number): string {
    const octetSize = Math.ceil((length * 3) / 4);
    const octets = crypto.getRandomValues(new Uint8Array(octetSize));
    return this.base64urlEncode(octets.buffer).slice(0, length);
  }
}
