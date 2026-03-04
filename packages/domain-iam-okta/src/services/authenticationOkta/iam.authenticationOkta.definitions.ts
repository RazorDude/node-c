import {
  IAMAuthenticationGetPayloadsFromExternalTokensData,
  IAMAuthenticationGetPayloadsFromExternalTokensResult,
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData,
  // IAMAuthenticationOAuth2AccessTokenProviderResponseData,
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult,
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult,
  IAMAuthenticationVerifyExternalAccessTokenData,
  IAMAuthenticationVerifyExternalAccessTokenResult
} from '@node-c/domain-iam';

// export interface IAMAuthenticationOktaAccessTokenProviderResponseData
//   extends IAMAuthenticationOAuth2AccessTokenProviderResponseData {
//   access_token: string;
//   expires_in: number;
//   id_token: string; // mandatory, since Okta uses OIDC
//   refresh_token: string;
//   scope: string;
//   token_type: string;
// }

export type IAMAuthenticationOktaCompleteData = IAMAuthenticationOAuth2CompleteData;

export type IAMAuthenticationOktaCompleteOptions<Context extends object> =
  IAMAuthenticationOAuth2CompleteOptions<Context>;

export interface IAMAuthenticationOktaCompleteResult extends IAMAuthenticationOAuth2CompleteResult {
  idToken: string;
  refreshToken: string;
}

export interface IAMAuthenticationOktaGetPayloadsFromExternalTokensData
  extends IAMAuthenticationGetPayloadsFromExternalTokensData {
  accessToken: string;
}

export type IAMAuthenticationOktaGetPayloadsFromExternalTokensResult =
  IAMAuthenticationGetPayloadsFromExternalTokensResult;

export type IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult =
  IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult;

export type IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData =
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData;

export interface IAMAuthenticationOktaInitiateData extends IAMAuthenticationOAuth2InitiateData {
  scope: string;
}

export type IAMAuthenticationOktaInitiateOptions<Context extends object> = Omit<
  IAMAuthenticationOAuth2InitiateOptions<Context>,
  'generateNonce' | 'withPCKE'
>;

export interface IAMAuthenticationOktaInitiateResult extends IAMAuthenticationOAuth2InitiateResult {
  authorizationCodeRequestURL: string;
  codeChallenge: string;
  codeVerifier: string;
  nonce: string;
  state: string;
}

export type IAMAuthenticationOktaRefreshExternalAccessTokenData = IAMAuthenticationRefreshExternalAccessTokenData;
export type IAMAuthenticationOktaRefreshExternalAccessTokenResult = IAMAuthenticationRefreshExternalAccessTokenResult;

export type IAMAuthenticationOktaVerifyExternalAccessTokenData = Pick<
  IAMAuthenticationVerifyExternalAccessTokenData,
  'accessToken'
>;
export type IAMAuthenticationOktaVerifyExternalAccessTokenResult = Pick<
  IAMAuthenticationVerifyExternalAccessTokenResult,
  'accessTokenPayload' | 'error'
>;
