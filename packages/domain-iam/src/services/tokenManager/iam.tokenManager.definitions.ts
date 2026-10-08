import { DomainCreateOptions } from '@node-c/core';

import {
  IAMAuthenticationType,
  IAMAuthenticationVerifyExternalAccessTokenResult
} from '../authentication/iam.authentication.definitions.js';

export interface BaseTokenEntityFields {
  externalToken?: string;
  externalTokenAuthService?: IAMAuthenticationType;
}

export interface DecodedTokenContent<TokenEntityFields> {
  aud: string;
  exp?: number;
  iat: number;
  iss: string;
  data?: TokenEntityFields & BaseTokenEntityFields;
}

export type TokenEntity<TokenEntityFields extends object> = {
  token: string;
  type: TokenType;
} & TokenEntityFields &
  BaseTokenEntityFields;

export type TokenManagerCreateData<TokenEntityFields extends object> = Partial<
  Omit<TokenEntity<TokenEntityFields>, 'token'>
>;

export type TokenManagerCreateOptions = {
  expiresInMinutes?: number;
  identifierDataField?: string;
  persist?: boolean;
  purgeOldFromData?: boolean;
  tokenContentOnlyFields?: string[];
  ttl?: number;
  useExternalTokenAsLocal?: boolean;
} & DomainCreateOptions;

export enum TokenType {
  Access = 'access',
  Id = 'id',
  Refresh = 'refresh'
}

export interface TokenManagerVerifyResult<TokenEntityFields> {
  content?: DecodedTokenContent<TokenEntityFields>;
  externalTokenData?: IAMAuthenticationVerifyExternalAccessTokenResult;
  error?: unknown;
}

export interface VerifyAccessTokenOptions {
  accessTokenDataRefreshTokenField?: string;
  deleteFromStoreIfExpired?: boolean;
  identifierDataField?: string;
  newAccessTokenExpiresInMinutes?: number;
  persistNewToken?: boolean;
  purgeStoreOnRenew?: boolean;
  refreshToken?: string;
}

export interface VerifyAccessTokenReturnData<TokenEntityFields> {
  content?: DecodedTokenContent<TokenEntityFields>;
  newAccessToken?: string;
  newIdToken?: string;
  newRefreshToken?: string;
}
