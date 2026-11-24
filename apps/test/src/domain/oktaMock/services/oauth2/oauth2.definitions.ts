export interface DomainOktaMockOAuth2AuthorizationCodeData {
  codeChallenge: string;
  email: string;
  name: string;
  nonce?: string;
  redirectUri: string;
  scope: string;
}

export interface DomainOktaMockOAuth2AuthorizeData {
  clientId: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  // the email of the user to log in - the mock has no login page
  loginHint?: string;
  nonce?: string;
  redirectUri: string;
  responseType: string;
  scope: string;
  state: string;
}

export interface DomainOktaMockOAuth2Settings {
  audience: string;
  clientId: string;
  clientSecret: string;
  issuer: string;
}

export interface DomainOktaMockOAuth2TokenData {
  clientId?: string;
  clientSecret?: string;
  code?: string;
  codeVerifier?: string;
  grantType?: string;
  redirectUri?: string;
}

// the response of Okta's token endpoint
export interface DomainOktaMockOAuth2TokenResult {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: 'Bearer';
}
