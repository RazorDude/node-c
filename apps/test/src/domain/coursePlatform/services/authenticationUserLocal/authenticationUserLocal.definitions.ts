import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';

export type CoursePlatformAuthenticationUserLocalCompleteData = IAMAuthenticationUserLocalCompleteData;

export type CoursePlatformAuthenticationUserLocalCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalCompleteOptions<Context>;

export type CoursePlatformAuthenticationUserLocalCompleteResult = IAMAuthenticationUserLocalCompleteResult;

export type CoursePlatformAuthenticationUserLocalUserFields = CacheUser & { password: string };
