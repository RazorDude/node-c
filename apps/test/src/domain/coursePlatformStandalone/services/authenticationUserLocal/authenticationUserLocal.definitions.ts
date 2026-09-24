import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult
} from '@node-c/domain-iam';

import { DataCacheStandaloneUser } from '../../../../data/cacheStandalone/entities/users/users.entity.js';

export type DomainCoursePlatformStandaloneAuthenticationUserLocalCompleteData = IAMAuthenticationUserLocalCompleteData;

export type DomainCoursePlatformStandaloneAuthenticationUserLocalCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalCompleteOptions<Context>;

export type DomainCoursePlatformStandaloneAuthenticationUserLocalCompleteResult =
  IAMAuthenticationUserLocalCompleteResult;

export type DomainCoursePlatformStandaloneAuthenticationUserLocalUserFields = DataCacheStandaloneUser & {
  password: string;
};
