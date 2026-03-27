import {
  IAMAuthenticationUserLocalCompleteData as BaseIAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions as BaseIAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult as BaseIAMAuthenticationUserLocalCompleteResult
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';

export type IAMAuthenticationUserLocalCompleteData = BaseIAMAuthenticationUserLocalCompleteData;

export type IAMAuthenticationUserLocalCompleteOptions<Context extends object> =
  BaseIAMAuthenticationUserLocalCompleteOptions<Context>;

export type IAMAuthenticationUserLocalCompleteResult = BaseIAMAuthenticationUserLocalCompleteResult;

export type IAMAuthenticationUserLocalUserFields = CacheUser & { password: string };
