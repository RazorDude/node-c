import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult
} from '@node-c/domain-iam';

import { DataCacheUser } from '../../../../data/cache/entities/users/users.entity.js';

export type DomainIAMAuthenticationUserLocalCompleteData = IAMAuthenticationUserLocalCompleteData;

export type DomainIAMAuthenticationUserLocalCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalCompleteOptions<Context>;

export type DomainIAMAuthenticationUserLocalCompleteResult = IAMAuthenticationUserLocalCompleteResult;

export type DomainIAMAuthenticationUserLocalUserFields = DataCacheUser & { password: string };
