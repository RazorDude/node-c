import {
  IAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult
} from '@node-c/domain-iam-okta';

import { CacheUser } from '../../../../data/cache';

export type CoursePlatformAuthenticationOktaCompleteData = IAMAuthenticationOktaCompleteData;

export type CoursePlatformAuthenticationOktaCompleteOptions<Context extends object> =
  IAMAuthenticationOktaCompleteOptions<Context>;

export type CoursePlatformAuthenticationOktaCompleteResult = IAMAuthenticationOktaCompleteResult;

export type CoursePlatformAuthenticationOktaGetUserDataFromExternalTokenPayloadsData =
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData;

export type CoursePlatformAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult =
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;

export type CoursePlatformAuthenticationOktaUserFields = CacheUser & { password: string };
