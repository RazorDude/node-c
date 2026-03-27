import {
  IAMAuthenticationUserLocalConsumerCompleteData,
  IAMAuthenticationUserLocalConsumerCompleteOptions,
  IAMAuthenticationUserLocalConsumerCompleteResult
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';

export type CoursePlatformAuthenticationUserLocalConsumerCompleteData = IAMAuthenticationUserLocalConsumerCompleteData;

export type CoursePlatformAuthenticationUserLocalConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalConsumerCompleteOptions<Context>;

export type CoursePlatformAuthenticationUserLocalConsumerCompleteResult =
  IAMAuthenticationUserLocalConsumerCompleteResult;

export type CoursePlatformAuthenticationUserLocalConsumerUserFields = CacheUser & { password: string };
