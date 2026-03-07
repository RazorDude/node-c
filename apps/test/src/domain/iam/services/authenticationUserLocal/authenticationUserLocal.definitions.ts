import {
  IAMAuthenticationUserLocalCompleteData as BaseIAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions as BaseIAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult as BaseIAMAuthenticationUserLocalCompleteResult
  // IAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult as BaseIAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult,
  // IAMAuthenticationUserLocalInitiateData as BaseIAMAuthenticationUserLocalInitiateData,
  // IAMAuthenticationUserLocalInitiateOptions as BaseIAMAuthenticationUserLocalInitiateOptions,
  // IAMAuthenticationUserLocalInitiateResult as BaseIAMAuthenticationUserLocalInitiateResult
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';

export type IAMAuthenticationUserLocalCompleteData = BaseIAMAuthenticationUserLocalCompleteData;

export type IAMAuthenticationUserLocalCompleteOptions<Context extends object> =
  BaseIAMAuthenticationUserLocalCompleteOptions<Context>;

export type IAMAuthenticationUserLocalCompleteResult = BaseIAMAuthenticationUserLocalCompleteResult;

// export type IAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult =
//   BaseIAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult;

// export type IAMAuthenticationUserLocalInitiateData = BaseIAMAuthenticationUserLocalInitiateData;

// export type IAMAuthenticationUserLocalInitiateOptions<Context extends object> =
//   BaseIAMAuthenticationUserLocalInitiateOptions<Context>;

// export type IAMAuthenticationUserLocalInitiateResult = BaseIAMAuthenticationUserLocalInitiateResult;

export type IAMAuthenticationUserLocalUserFields = CacheUser & { password: string };
