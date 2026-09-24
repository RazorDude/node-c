import {
  IAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult
} from '@node-c/domain-iam-okta';

import { DataCacheStandaloneUser } from '../../../../data/cacheStandalone/entities/users/users.entity.js';

export type DomainCoursePlatformStandaloneAuthenticationOktaCompleteData = IAMAuthenticationOktaCompleteData;

export type DomainCoursePlatformStandaloneAuthenticationOktaCompleteOptions<Context extends object> =
  IAMAuthenticationOktaCompleteOptions<Context>;

export type DomainCoursePlatformStandaloneAuthenticationOktaCompleteResult = IAMAuthenticationOktaCompleteResult;

export type DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsData =
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData;

export type DomainCoursePlatformStandaloneAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult =
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;

export type DomainCoursePlatformStandaloneAuthenticationOktaUserFields = DataCacheStandaloneUser;
