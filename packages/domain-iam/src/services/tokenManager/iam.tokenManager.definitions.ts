import { DomainCreateOptions } from '@node-c/core';

import { IAMAuthenticationType, IAMAuthenticationVerifyExternalAccessTokenResult } from '../authentication';

export interface BaseTokenEntityFields {
  externalToken?: string;
  externalTokenAuthService?: IAMAuthenticationType;
}

export type DecodedTokenContent<TokenEntityFields> = {
  exp?: number;
  iat: number;
  data?: TokenEntityFields & BaseTokenEntityFields;
};

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
} & DomainCreateOptions;

export enum TokenType {
  // eslint-disable-next-line no-unused-vars
  Access = 'access',
  // eslint-disable-next-line no-unused-vars
  Refresh = 'refresh'
}

export interface TokenManagerVerifyResult<TokenEntityFields> {
  content?: DecodedTokenContent<TokenEntityFields>;
  externalTokenData?: IAMAuthenticationVerifyExternalAccessTokenResult;
  error?: unknown;
}

export interface VerifyAccessTokenOptions {
  deleteFromStoreIfExpired?: boolean;
  identifierDataField?: string;
  newTokenExpiresInMinutes?: number;
  persistNewToken?: boolean;
  purgeStoreOnRenew?: boolean;
  refreshToken?: string;
  refreshTokenAccessTokenIdentifierDataField?: string;
}

export interface VerifyAccessTokenReturnData<TokenEntityFields> {
  content?: DecodedTokenContent<TokenEntityFields>;
  newToken?: string;
}
