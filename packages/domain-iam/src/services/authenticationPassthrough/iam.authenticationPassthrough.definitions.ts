import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetUserAuthenticationConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult
} from '../authentication';

export type IAMAuthenticationPassthroughCompleteData = IAMAuthenticationCompleteData & {
  externalAccessToken?: string;
  externalAccessTokenExpiresIn?: number;
  externalIdToken?: string;
  externalRefreshToken?: string;
  externalRefreshTokenExpiresIn?: number;
};

export type IAMAuthenticationPassthroughCompleteOptions<Context extends object> =
  IAMAuthenticationCompleteOptions<Context>;

export type IAMAuthenticationPassthroughCompleteResult = IAMAuthenticationCompleteResult;

export type IAMAuthenticationPassthroughGetUserAuthenticationConfigResult =
  IAMAuthenticationGetUserAuthenticationConfigResult;

export type IAMAuthenticationPassthroughInitiateData = IAMAuthenticationInitiateData;

export type IAMAuthenticationPassthroughInitiateOptions<Context extends object> =
  IAMAuthenticationInitiateOptions<Context>;

export type IAMAuthenticationPassthroughInitiateResult = IAMAuthenticationInitiateResult;
