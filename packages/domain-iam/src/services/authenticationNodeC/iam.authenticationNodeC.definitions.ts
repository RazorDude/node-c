import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '../authentication';

export type IAMAuthenticationNodeCCompleteData = IAMAuthenticationCompleteData;

export type IAMAuthenticationNodeCCompleteOptions<Context extends object> = IAMAuthenticationCompleteOptions<Context>;

export interface IAMAuthenticationNodeCCompleteResult extends IAMAuthenticationCompleteResult {
  idToken?: string;
  refreshToken?: string;
}

export type IAMAuthenticationNodeCInitiateData = IAMAuthenticationInitiateData;

export type IAMAuthenticationNodeCInitiateOptions<Context extends object> = IAMAuthenticationInitiateOptions<Context>;

export type IAMAuthenticationNodeCInitiateResult = IAMAuthenticationInitiateResult;

export type IAMAuthenticationNodeCRefreshExternalAccessTokenData = IAMAuthenticationRefreshExternalAccessTokenData;
export type IAMAuthenticationNodeCRefreshExternalAccessTokenResult = IAMAuthenticationRefreshExternalAccessTokenResult;
