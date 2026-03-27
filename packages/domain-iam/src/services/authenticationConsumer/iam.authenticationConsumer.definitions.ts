import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetUserAuthenticationConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '../authentication';

export type IAMAuthenticationConsumerCompleteData = IAMAuthenticationCompleteData;

export type IAMAuthenticationConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationCompleteOptions<Context>;

export interface IAMAuthenticationConsumerCompleteResult extends IAMAuthenticationCompleteResult {
  idToken?: string;
  refreshToken?: string;
}

export type IAMAuthenticationConsumerGetUserAuthenticationConfigResult =
  IAMAuthenticationGetUserAuthenticationConfigResult;

export type IAMAuthenticationConsumerInitiateData = IAMAuthenticationInitiateData;

export type IAMAuthenticationConsumerInitiateOptions<Context extends object> =
  IAMAuthenticationInitiateOptions<Context>;

export type IAMAuthenticationConsumerInitiateResult = IAMAuthenticationInitiateResult;

export type IAMAuthenticationConsumerRefreshExternalAccessTokenData = IAMAuthenticationRefreshExternalAccessTokenData;
export type IAMAuthenticationConsumerRefreshExternalAccessTokenResult =
  IAMAuthenticationRefreshExternalAccessTokenResult;
