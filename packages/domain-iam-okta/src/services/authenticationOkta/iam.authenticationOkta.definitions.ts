import {
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsResult,
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult,
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '@node-c/domain-iam';

export type IAMAuthenticationOktaCompleteData = IAMAuthenticationOAuth2CompleteData;

export type IAMAuthenticationOktaCompleteOptions<Context extends object> =
  IAMAuthenticationOAuth2CompleteOptions<Context>;

export interface IAMAuthenticationOktaCompleteResult extends IAMAuthenticationOAuth2CompleteResult {
  idToken: string;
  refreshToken: string;
}

export type IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult =
  IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult;

export type IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData =
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData;

export type IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult =
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsResult;

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
