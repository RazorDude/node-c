import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult
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
  // accessTokenPayload?: GenericObject;
  // idTokenPayload?: GenericObject;
  // refreshTokenPayload?: GenericObject;
  accessToken: string;
  accessTokenExpiresIn?: number;
  idToken?: string;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
  scope: string;
}

export type IAMAuthenticationOauth2GetUserCreateAccessTokenConfigResult =
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
