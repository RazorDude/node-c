import {
  IAMAuthenticationOktaCompleteData as BaseIAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions as BaseIAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult as BaseIAMAuthenticationOktaCompleteResult
  // IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult as BaseIAMAuthenticationOktaGetUserCreateAccessTokenConfigResult,
  // IAMAuthenticationOktaInitiateData as BaseIAMAuthenticationOktaInitiateData,
  // IAMAuthenticationOktaInitiateOptions as BaseIAMAuthenticationOktaInitiateOptions,
  // IAMAuthenticationOktaInitiateResult as BaseIAMAuthenticationOktaInitiateResult
} from '@node-c/domain-iam-okta';

import { CacheUser } from '../../../../data/cache';

export type IAMAuthenticationOktaCompleteData = BaseIAMAuthenticationOktaCompleteData;

export type IAMAuthenticationOktaCompleteOptions<Context extends object> =
  BaseIAMAuthenticationOktaCompleteOptions<Context>;

export type IAMAuthenticationOktaCompleteResult = BaseIAMAuthenticationOktaCompleteResult;

// export type IAMAuthenticationOktaGetUserCreateAccessTokenConfigResult =
//   BaseIAMAuthenticationOktaGetUserCreateAccessTokenConfigResult;

// export type IAMAuthenticationOktaInitiateData = BaseIAMAuthenticationOktaInitiateData;

// export type IAMAuthenticationOktaInitiateOptions<Context extends object> =
//   BaseIAMAuthenticationOktaInitiateOptions<Context>;

// export type IAMAuthenticationOktaInitiateResult = BaseIAMAuthenticationOktaInitiateResult;

export type IAMAuthenticationOktaUserFields = CacheUser & { password: string };
