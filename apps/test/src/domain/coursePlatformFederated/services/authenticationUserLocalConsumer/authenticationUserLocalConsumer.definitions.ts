import {
  IAMAuthenticationUserLocalConsumerCompleteData,
  IAMAuthenticationUserLocalConsumerCompleteOptions,
  IAMAuthenticationUserLocalConsumerCompleteResult
} from '@node-c/domain-iam';

import { DataCacheUser } from '../../../../data/cache/entities/users/users.entity.js';

export type DomainCoursePlatformFederatedAuthenticationUserLocalConsumerCompleteData =
  IAMAuthenticationUserLocalConsumerCompleteData;

export type DomainCoursePlatformFederatedAuthenticationUserLocalConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalConsumerCompleteOptions<Context>;

export type DomainCoursePlatformFederatedAuthenticationUserLocalConsumerCompleteResult =
  IAMAuthenticationUserLocalConsumerCompleteResult;

export type DomainCoursePlatformFederatedAuthenticationUserLocalConsumerUserFields = DataCacheUser;
