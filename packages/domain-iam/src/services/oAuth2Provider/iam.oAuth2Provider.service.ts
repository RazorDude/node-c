import { AppConfigDomainIAM, ConfigProviderService, base64UrlEncode } from '@node-c/core';

import { GetAuthorizationUrlData } from './iam.oAuth2Provider.definitions';

export class IAMOAuth2ProviderService {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected providerName: string
  ) {}

  getAuthorizationCodeRequestUrl(data: GetAuthorizationUrlData): string {
    const { configProvider, moduleName, providerName } = this;
    const { authorizationUrl, clientId, codeChallengeMethod, defaultScope, redirectUri } = (
      configProvider.config.domain[moduleName] as AppConfigDomainIAM
    ).oauth2![providerName];
    const { challenge, scope, state } = data;
    return (
      `${authorizationUrl}?` +
      `client_id=${clientId}&` +
      `redirect_uri=${base64UrlEncode(redirectUri!)}&` +
      `scope=${scope || defaultScope}&` +
      `state=${state}&` +
      `code_challenge=${challenge}&` +
      `code_challenge_method=${codeChallengeMethod}&`
    );
  }
}
