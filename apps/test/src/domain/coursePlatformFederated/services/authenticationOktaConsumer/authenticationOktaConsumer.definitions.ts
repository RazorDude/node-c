import {
  IAMAuthenticationOAuth2ConsumerCompleteData,
  IAMAuthenticationOAuth2ConsumerCompleteOptions,
  IAMAuthenticationOAuth2ConsumerCompleteResult
} from '@node-c/domain-iam';

import { DataCacheUser } from '../../../../data/cache';

export type DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteData =
  IAMAuthenticationOAuth2ConsumerCompleteData;

export type DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationOAuth2ConsumerCompleteOptions<Context>;

export type DomainCoursePlatformFederatedAuthenticationOktaConsumerCompleteResult =
  IAMAuthenticationOAuth2ConsumerCompleteResult;

export type DomainCoursePlatformFederatedAuthenticationOktaConsumerUserFields = DataCacheUser;
