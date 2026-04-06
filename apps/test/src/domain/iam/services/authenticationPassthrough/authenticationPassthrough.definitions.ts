import {
  IAMAuthenticationPassthroughCompleteData,
  IAMAuthenticationPassthroughCompleteOptions,
  IAMAuthenticationPassthroughCompleteResult
} from '@node-c/domain-iam';

import { DataCacheUser } from '../../../../data/cache';

export type DomainIAMAuthenticationPassthroughCompleteData = IAMAuthenticationPassthroughCompleteData;

export type DomainIAMAuthenticationPassthroughCompleteOptions<Context extends object> =
  IAMAuthenticationPassthroughCompleteOptions<Context>;

export type DomainIAMAuthenticationPassthroughCompleteResult = IAMAuthenticationPassthroughCompleteResult;

export type DomainIAMAuthenticationPassthroughUserFields = DataCacheUser;
