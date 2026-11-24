import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetUserAuthenticationConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult
} from '../authentication/iam.authentication.definitions.js';

export type IAMAuthenticationPassthroughCompleteData =
  IAMAuthenticationCompleteData & {
    externalAccessToken?: string;
    // in seconds
    externalAccessTokenExpiresIn?: number;
    externalIdToken?: string;
    externalRefreshToken?: string;
    // in seconds
    externalRefreshTokenExpiresIn?: number;
  };

export type IAMAuthenticationPassthroughCompleteOptions<
  Context extends object
> = IAMAuthenticationCompleteOptions<Context>;

export type IAMAuthenticationPassthroughCompleteResult =
  IAMAuthenticationCompleteResult;

export type IAMAuthenticationPassthroughGetUserAuthenticationConfigResult =
  IAMAuthenticationGetUserAuthenticationConfigResult;

export type IAMAuthenticationPassthroughInitiateData =
  IAMAuthenticationInitiateData;

export type IAMAuthenticationPassthroughInitiateOptions<
  Context extends object
> = IAMAuthenticationInitiateOptions<Context>;

export type IAMAuthenticationPassthroughInitiateResult =
  IAMAuthenticationInitiateResult;
