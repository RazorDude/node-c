import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult
} from '@node-c/domain-iam';

import { DataCacheUser } from '../../../../data/cache';

export type DomainIAMAuthenticationUserLocalCompleteData = IAMAuthenticationUserLocalCompleteData;

export type DomainIAMAuthenticationUserLocalCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalCompleteOptions<Context>;

export type DomainIAMAuthenticationUserLocalCompleteResult = IAMAuthenticationUserLocalCompleteResult;

export type DomainIAMAuthenticationUserLocalUserFields = DataCacheUser & { password: string };
