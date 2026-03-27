import {
  IAMAuthenticationOktaCompleteData as BaseIAMAuthenticationOktaCompleteData,
  IAMAuthenticationOktaCompleteOptions as BaseIAMAuthenticationOktaCompleteOptions,
  IAMAuthenticationOktaCompleteResult as BaseIAMAuthenticationOktaCompleteResult,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData as BaseIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult as BaseIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult
} from '@node-c/domain-iam-okta';

import { CacheUser } from '../../../../data/cache';

export type IAMAuthenticationOktaCompleteData = BaseIAMAuthenticationOktaCompleteData;

export type IAMAuthenticationOktaCompleteOptions<Context extends object> =
  BaseIAMAuthenticationOktaCompleteOptions<Context>;

export type IAMAuthenticationOktaCompleteResult = BaseIAMAuthenticationOktaCompleteResult;

export type IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData =
  BaseIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsData;

export type IAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult =
  BaseIAMAuthenticationOktaGetUserDataFromExternalTokenPayloadsResult;

export type IAMAuthenticationOktaUserFields = CacheUser & { password: string };
