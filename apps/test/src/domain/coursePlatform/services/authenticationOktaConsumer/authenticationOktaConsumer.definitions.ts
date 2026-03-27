import {
  IAMAuthenticationOAuth2ConsumerCompleteData,
  IAMAuthenticationOAuth2ConsumerCompleteOptions,
  IAMAuthenticationOAuth2ConsumerCompleteResult
} from '@node-c/domain-iam';

import { CacheUser } from '../../../../data/cache';

export type CoursePlatformAuthenticationOktaConsumerCompleteData = IAMAuthenticationOAuth2ConsumerCompleteData;

export type CoursePlatformAuthenticationOktaConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationOAuth2ConsumerCompleteOptions<Context>;

export type CoursePlatformAuthenticationOktaConsumerCompleteResult = IAMAuthenticationOAuth2ConsumerCompleteResult;

export type CoursePlatformAuthenticationOktaConsumerUserFields = CacheUser & { password: string };
