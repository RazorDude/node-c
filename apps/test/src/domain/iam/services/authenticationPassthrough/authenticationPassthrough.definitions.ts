import {
  IAMAuthenticationPassthroughCompleteData as BaseIAMAuthenticationPassthroughCompleteData,
  IAMAuthenticationPassthroughCompleteOptions as BaseIAMAuthenticationPassthroughCompleteOptions,
  IAMAuthenticationPassthroughCompleteResult as BaseIAMAuthenticationPassthroughCompleteResult
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';

export type IAMAuthenticationPassthroughCompleteData = BaseIAMAuthenticationPassthroughCompleteData;

export type IAMAuthenticationPassthroughCompleteOptions<Context extends object> =
  BaseIAMAuthenticationPassthroughCompleteOptions<Context>;

export type IAMAuthenticationPassthroughCompleteResult = BaseIAMAuthenticationPassthroughCompleteResult;

export type IAMAuthenticationPassthroughUserFields = CacheUser & { password: string };
