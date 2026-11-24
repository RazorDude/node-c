import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import {
  ApplicationError,
  ConfigProviderService,
  type GenericObject
} from '@node-c/core';

import { Constants } from '../../../../common/definitions/common.constants.js';
import { AppConfigTestApp } from '../../../../common/definitions/common.definitions.js';
import { DataOktaMockUsersService } from '../../../../data/oktaMock/entities/users/users.service.js';

import {
  DomainOktaMockOAuth2AuthorizationCodeData,
  DomainOktaMockOAuth2AuthorizeData,
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
  protected authorizationCodes = new Map<
    string,
    DomainOktaMockOAuth2AuthorizationCodeData
  >();

  constructor(
    protected configProvider: ConfigProviderService<AppConfigTestApp>,
    protected dataUsersService: DataOktaMockUsersService
  ) {}

  async authorize(data: DomainOktaMockOAuth2AuthorizeData): Promise<string> {
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
    const { domain } = this.configProvider.config;
    const oktaSettings = domain.iam.authServiceSettings!.okta.oauth2!;
    const user = loginHint
      ? await this.dataUsersService.findOne({ filters: { email: loginHint } })
      : null;
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('state', state);
    if (
      responseType !== 'code' ||
      clientId !== oktaSettings.clientId ||
      codeChallengeMethod !== 'S256' ||
      !user
    ) {
      redirectUrl.searchParams.set('error', 'access_denied');
      return redirectUrl.toString();
    }
    const code = crypto
      .randomBytes(domain.oktaMock.authorizationCodeLengthInBytes)
      .toString('hex');
    this.authorizationCodes.set(code, {
      codeChallenge,
      email: user.email,
      name: user.name,
      nonce,
      redirectUri,
      scope
    });
    redirectUrl.searchParams.set('code', code);
    return redirectUrl.toString();
  }

  exchangeAuthorizationCode(
    data: DomainOktaMockOAuth2TokenData
  ): DomainOktaMockOAuth2TokenResult {
    const { domain } = this.configProvider.config;
    const { accessTokenExpiresInSeconds, refreshTokenLengthInBytes } =
      domain.oktaMock;
    const { accessTokenAudiences, clientId, clientSecret, issuerUri } =
      domain.iam.authServiceSettings!.okta.oauth2!;
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
      data.clientId !== clientId ||
      data.clientSecret !== clientSecret ||
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
      Date.now() / Constants.MILLISECONDS_IN_A_SECOND
    );
    const expiresAt = issuedAt + accessTokenExpiresInSeconds;
    return {
      access_token: this.signToken(
        {
          aud: accessTokenAudiences![0],
          cid: clientId,
          exp: expiresAt,
          iat: issuedAt,
          iss: issuerUri,
          scp: scope.split(' '),
          sub: email
        },
        clientSecret
      ),
      expires_in: accessTokenExpiresInSeconds,
      id_token: this.signToken(
        {
          aud: clientId,
          email,
          exp: expiresAt,
          iat: issuedAt,
          iss: issuerUri,
          name,
          nonce,
          sub: email
        },
        clientSecret
      ),
      refresh_token: crypto
        .randomBytes(refreshTokenLengthInBytes)
        .toString('hex'),
      scope,
      token_type: 'Bearer'
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
}
