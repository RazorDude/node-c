import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import {
  type AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  type GenericObject
} from '@node-c/core';

import {
  DomainOktaMockOAuth2AuthorizationCodeData,
  DomainOktaMockOAuth2AuthorizeData,
  DomainOktaMockOAuth2Settings,
  DomainOktaMockOAuth2TokenData,
  DomainOktaMockOAuth2TokenResult
} from './oauth2.definitions.js';

/*
 * A mock of Okta's OAuth2 authorization code flow with PKCE, for the e2e tests. It has no login page - the user is
 * picked by the login hint. The tokens are signed with the client secret, since NodeC doesn't verify the signature of
 * Okta's tokens.
 */
@Injectable()
export class DomainOktaMockOAuth2Service {
  static readonly ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;
  static readonly AUTHORIZATION_CODE_LENGTH_IN_BYTES = 16;
  static readonly MILLISECONDS_IN_A_SECOND = 1000;
  static readonly REFRESH_TOKEN_LENGTH_IN_BYTES = 32;
  // the users that can log in, and their names - an object whose keys are the emails
  static readonly USERS: Record<string, string> = {
    'admin@node-c.com': 'Admin User',
    'user0@node-c.com': 'User Zero'
  };

  protected authorizationCodes = new Map<
    string,
    DomainOktaMockOAuth2AuthorizationCodeData
  >();

  constructor(protected configProvider: ConfigProviderService) {}

  // returns the URL to redirect the user to - with a code, or with an error
  authorize(data: DomainOktaMockOAuth2AuthorizeData): string {
    const {
      clientId,
      codeChallenge,
      codeChallengeMethod,
      loginHint,
      nonce,
      redirectUri,
      responseType,
      scope,
      state
    } = data;
    const settings = this.getSettings();
    const name = loginHint ? DomainOktaMockOAuth2Service.USERS[loginHint] : '';
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('state', state);
    if (
      responseType !== 'code' ||
      clientId !== settings.clientId ||
      codeChallengeMethod !== 'S256' ||
      !name
    ) {
      redirectUrl.searchParams.set('error', 'access_denied');
      return redirectUrl.toString();
    }
    const code = crypto
      .randomBytes(DomainOktaMockOAuth2Service.AUTHORIZATION_CODE_LENGTH_IN_BYTES)
      .toString('hex');
    this.authorizationCodes.set(code, {
      codeChallenge,
      email: loginHint!,
      name,
      nonce,
      redirectUri,
      scope
    });
    redirectUrl.searchParams.set('code', code);
    return redirectUrl.toString();
  }

  protected getSettings(): DomainOktaMockOAuth2Settings {
    // the mock serves the Okta logins of the IAM domain module (the SSO app)
    const { accessTokenAudiences, clientId, clientSecret, issuerUri } = (
      this.configProvider.config.domain.iam as AppConfigDomainIAM
    ).authServiceSettings!.okta.oauth2!;
    return {
      audience: accessTokenAudiences![0],
      clientId,
      clientSecret,
      issuer: issuerUri!
    };
  }

  protected signToken(payload: GenericObject, secret: string): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  token(data: DomainOktaMockOAuth2TokenData): DomainOktaMockOAuth2TokenResult {
    const settings = this.getSettings();
    const code = data.code || '';
    const codeData = this.authorizationCodes.get(code);
    // an authorization code can only be used once
    this.authorizationCodes.delete(code);
    const expectedCodeChallenge = crypto
      .createHash('sha256')
      .update(data.codeVerifier || '')
      .digest('base64url');
    if (
      data.grantType !== 'authorization_code' ||
      data.clientId !== settings.clientId ||
      data.clientSecret !== settings.clientSecret ||
      !codeData ||
      codeData.redirectUri !== data.redirectUri ||
      codeData.codeChallenge !== expectedCodeChallenge
    ) {
      throw new ApplicationError(
        'invalid_grant: The authorization code is invalid or has expired.'
      );
    }
    const { email, name, nonce, scope } = codeData;
    const issuedAt = Math.floor(
      Date.now() / DomainOktaMockOAuth2Service.MILLISECONDS_IN_A_SECOND
    );
    const expiresAt =
      issuedAt + DomainOktaMockOAuth2Service.ACCESS_TOKEN_EXPIRES_IN_SECONDS;
    return {
      access_token: this.signToken(
        {
          aud: settings.audience,
          cid: settings.clientId,
          exp: expiresAt,
          iat: issuedAt,
          iss: settings.issuer,
          scp: scope.split(' '),
          sub: email
        },
        settings.clientSecret
      ),
      expires_in: DomainOktaMockOAuth2Service.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      id_token: this.signToken(
        {
          aud: settings.clientId,
          email,
          exp: expiresAt,
          iat: issuedAt,
          iss: settings.issuer,
          name,
          nonce,
          sub: email
        },
        settings.clientSecret
      ),
      refresh_token: crypto
        .randomBytes(DomainOktaMockOAuth2Service.REFRESH_TOKEN_LENGTH_IN_BYTES)
        .toString('hex'),
      scope,
      token_type: 'Bearer'
    };
  }
}
