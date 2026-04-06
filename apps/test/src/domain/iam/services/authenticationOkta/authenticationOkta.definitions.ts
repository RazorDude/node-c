import {
  IAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult
} from '@node-c/domain-iam-okta';

import { DataCacheUser } from '../../../../data/cache';

export type DomainIAMAuthenticationOktaCompleteData = IAMAuthenticationOktaCompleteData;

export type DomainIAMAuthenticationOktaCompleteOptions<Context extends object> =
  IAMAuthenticationOktaCompleteOptions<Context>;

export type DomainIAMAuthenticationOktaCompleteResult = IAMAuthenticationOktaCompleteResult;

export type DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData =
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData;

export type DomainIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult =
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;

export type DomainIAMAuthenticationOktaUserFields = DataCacheUser;
