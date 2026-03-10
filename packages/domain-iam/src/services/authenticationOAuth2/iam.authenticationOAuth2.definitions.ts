import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetPayloadsFromExternalTokensData,
  IAMAuthenticationGetPayloadsFromExternalTokensResult,
  IAMAuthenticationGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationVerifyExternalAccessTokenData,
  IAMAuthenticationVerifyExternalAccessTokenResult
} from '../authentication';

export interface IAMAuthenticationOAuth2AccessTokenProviderResponseData {
  access_token: string;
  expires_in?: number;
  id_token?: string; // only available for OIDC
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface IAMAuthenticationOAuth2CompleteData extends IAMAuthenticationCompleteData {
  code: string;
  codeVerifier: string;
  state: string;
}

export type IAMAuthenticationOAuth2CompleteOptions<Context extends object> = IAMAuthenticationCompleteOptions<Context>;

export interface IAMAuthenticationOAuth2CompleteResult extends IAMAuthenticationCompleteResult {
  accessToken: string;
  scope: string;
}

export type IAMAuthenticationOAuth2GetPayloadsFromExternalTokensData =
  IAMAuthenticationGetPayloadsFromExternalTokensData;

export type IAMAuthenticationOAuth2GetPayloadsFromExternalTokensResult =
  IAMAuthenticationGetPayloadsFromExternalTokensResult;

export type IAMAuthenticationOAuth2GetUserCreateAccessTokenConfigResult =
  IAMAuthenticationGetUserCreateAccessTokenConfigResult;

export interface IAMAuthenticationOAuth2InitiateData extends IAMAuthenticationInitiateData {
  scope?: string;
}

export interface IAMAuthenticationOAuth2InitiateOptions<Context extends object>
  extends IAMAuthenticationInitiateOptions<Context> {
  generateNonce?: boolean;
  withPCKE?: boolean;
}

export interface IAMAuthenticationOAuth2InitiateResult extends IAMAuthenticationInitiateResult {
  authorizationCodeRequestURL: string;
  codeChallenge?: string;
  codeVerifier?: string;
  nonce?: string;
  state: string;
}

export type IAMAuthenticationOAuth2VerifyExternalAccessTokenData = Pick<
  IAMAuthenticationVerifyExternalAccessTokenData,
  'accessToken'
>;
export type IAMAuthenticationOAuth2VerifyExternalAccessTokenResult = Pick<
  IAMAuthenticationVerifyExternalAccessTokenResult,
  'accessTokenPayload' | 'error'
>;
